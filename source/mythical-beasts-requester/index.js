const tracingUtils = require('./tracing')('requester', 'mythical-requester');
const Pyroscope = require('@pyroscope/nodejs');
const axios = require('axios');
const { uniqueNamesGenerator, names, colors, animals } = require('unique-names-generator');
const logUtils = require('./logging')('mythical-requester', 'requester');
const express = require('express');
const promClient = require('prom-client');
const { nameSet, servicePrefix, spanTag, accumulators }  = require('./endpoints')();
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

const QUEUE_URL = process.env.SQS_QUEUE_URL;

if (!QUEUE_URL) {
    console.error('SQS_QUEUE_URL environment variable is required');
    process.exit(1);
}

const sendSQSMessage = async (message, tracingObj) => {
    const { api, tracer } = tracingObj;

    return tracer.startActiveSpan('sqs_send_message', async (span) => {
        try {
            span.setAttribute('messaging.system', 'sqs');
            span.setAttribute('messaging.destination', QUEUE_URL);
            span.setAttribute('messaging.operation', 'send');

            const command = new SendMessageCommand({
                QueueUrl: QUEUE_URL,
                MessageBody: message,
                MessageAttributes: {
                    'source': {
                        DataType: 'String',
                        StringValue: 'mythical-requester'
                    },
                    'timestamp': {
                        DataType: 'String',
                        StringValue: new Date().toISOString()
                    }
                }
            });

            const result = await sqsClient.send(command);
            console.log(`Message sent to SQS: ${message}, MessageId: ${result.MessageId}`);

            span.setAttribute('messaging.message_id', result.MessageId);
            span.setStatus({ code: api.SpanStatusCode.OK });

        } catch (error) {
            console.error('Error sending message to SQS:', error);
            span.recordException(error);
            span.setStatus({
                code: api.SpanStatusCode.ERROR,
                message: error.message
            });
            throw error;
        } finally {
            span.end();
        }
    });
};

// Prometheus client registration
const app = express();
const register = promClient.register;
register.setContentType(promClient.Registry.OPENMETRICS_CONTENT_TYPE);

let logEntry;

// What a horrible thing to do, global span context for linking.
// You would not do this in production code, you'd use propagation and baggage.
let previousReqSpanContext;

// Status response bucket (histogram)
const dangerGauge = new promClient.Gauge({
    name: 'mythical_danger_level_30s',
    help: 'Recent accumulated danger level over the past 30 seconds',
});

// Metrics endpoint handler (for Prometheus scraping)
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
});

// Initialise the Pyroscope library to send pprof data.
Pyroscope.init({
    serverAddress: `http://${process.env.PROFILE_COLLECTOR_HOST}:${process.env.PROFILE_COLLECTOR_PORT}`,
    appName: 'mythical-requester',
    wall: {
        collectCpuTime: true,
    },
    tags: {
        namespace: `${process.env.NAMESPACE ?? 'mythical'}`,
    },
});
Pyroscope.start();

// We just keep going, requesting names and adding them
const makeRequest = async (tracingObj, logEntry) => {
    const { api, tracer, propagator } = tracingObj;
    const type = (Math.floor(Math.random() * 100) < 50) ? 'GET' : 'POST';
    const index = Math.floor(Math.random() * nameSet.length);
    const endpoint = nameSet[index];
    const dangerLevel = accumulators[index];
    let headers = {};
    let error = false;

    // This method is used to generate a time 40 minutes in the past for the logs.
    let timeshift = () => {
        var date = (process.env.TIMESHIFT) ? new Date(Date.now() - (1000 * 60 * 40)) : new Date(Date.now());
        return date.toISOString();
    }

    // Create a new span, link to previous request to show how linking between traces works.
    const requestSpan = tracer.startSpan('requester', {
        kind: api.SpanKind.CLIENT,
        links: (previousReqSpanContext) ? [{ context: previousReqSpanContext }] : undefined,
    });
    requestSpan.setAttribute(spanTag, endpoint);
    requestSpan.setAttribute(`http.target`, '/' + endpoint);
    requestSpan.setAttribute(`http.method`, type);
    requestSpan.setAttribute('service.version', (Math.floor(Math.random() * 100)) < 50 ? '1.9.2' : '2.0.0');
    previousReqSpanContext = requestSpan.spanContext();
    const { traceId } = requestSpan.spanContext();

    // Increment the danger level on the gauge
    dangerGauge.inc(dangerLevel);

    let serverHostPort = "mythical-server:4000"
    // check env var for override
    if (process.env.MYTHICAL_SERVER_HOST_PORT) {
        serverHostPort = process.env.MYTHICAL_SERVER_HOST_PORT
    }

    // Create a new context for this request
    api.context.with(api.trace.setSpan(api.context.active(), requestSpan), async () => {
        const start = Date.now();
        // Add the headers required for trace propagation
        headers = propagator(requestSpan);

        if (type === 'GET') {
            let names;
            try {
                const result = await axios.get(`http://${serverHostPort}/${endpoint}`, { headers });
                await sendSQSMessage(`GET /${endpoint}`, tracingObj);
                logEntry({
                    level: 'info',
                    namespace: process.env.NAMESPACE,
                    job: `${servicePrefix}-requester`,
                    endpointLabel: spanTag,
                    endpoint,
                    message: `traceID=${traceId} http.method=GET endpoint=${endpoint} loggedtime=${timeshift()} status=SUCCESS`,
                });
                names = result.data;

                // Deletion probability is based on the array index.
                let delProb = (index / nameSet.length) * 100;
                if (Math.floor(Math.random() * 100) < delProb) {
                    if (names.length > 0) {
                        await axios.delete(`http://${serverHostPort}/${endpoint}`, {
                            data: { name: names[0].name },
                            headers: headers
                        });
                        await sendSQSMessage(`DELETE /${endpoint} ${names[0].name}`, tracingObj);
                        logEntry({
                            level: 'info',
                            namespace: process.env.NAMESPACE,
                            job: `${servicePrefix}-requester`,
                            endpointLabel: spanTag,
                            endpoint,
                            message: `traceID=${traceId} http.method=DELETE endpoint=${endpoint} loggedtime=${timeshift()} status=SUCCESS`,
                        });
                    }
                }
            } catch (err) {
                logEntry({
                    level: 'error',
                    namespace: process.env.NAMESPACE,
                    job: `${servicePrefix}-requester`,
                    endpointLabel: spanTag,
                    endpoint,
                    message: `traceID=${traceId} http.method=DELETE endpoint=${endpoint} ` +
                        `name=${(names) ? names[0].name : 'unknown'} status=FAILURE loggedtime=${timeshift()}`,
                });
                error = true;
            }
        } else {
            // Generate new name
            const randomName = uniqueNamesGenerator({ dictionaries: [colors, names, animals] });
            const body = { name : randomName };
            try {
                await axios.post(`http://${serverHostPort}/${endpoint}`, body, { headers });
                await sendSQSMessage(`POST /${endpoint} ${JSON.stringify(body)}`, tracingObj);
                logEntry({
                    level: 'info',
                    namespace: process.env.NAMESPACE,
                    job: `${servicePrefix}-requester`,
                    endpointLabel: spanTag,
                    endpoint,
                    message: `traceID=${traceId} http.method=POST endpoint=${endpoint} loggedtime=${timeshift()} status=SUCCESS`,
                });
            } catch (err) {
                // The error condition is a little different here to using request. Axios throws a more generic error
                // which means that it's not obvious from the logs went wrong. You need to look at the mythical-server
                // logs to do so. This is a better example of drilldown and triage to previously.
                logEntry({
                    level: 'error',
                    namespace: process.env.NAMESPACE,
                    job: `${servicePrefix}-requester`,
                    endpointLabel: spanTag,
                    endpoint,
                    message: `traceID=${traceId} http.method=POST endpoint=${endpoint} name=${randomName}` +
                        ` loggedtime=${timeshift()} status=FAILURE`,
                });
                error = true;
            }

        }
        logEntry({
            level: 'info',
            namespace: process.env.NAMESPACE,
            job: `${servicePrefix}-requester`,
            endpointLabel: spanTag,
            endpoint,
            message: `traceID=${traceId} http.method=${type} endpoint=${endpoint} duration=${Date.now() - start}ms loggedtime=${timeshift()}`,
        });

        // Set the status code as OK and end the span
        if (error) {
            const version = (Math.floor(Math.random() * 100));
            if (version < 70) {
                requestSpan.setAttribute('service.version', '2.0.0');
            }
        }
        requestSpan.setStatus({ code: (!error) ? api.SpanStatusCode.OK : api.SpanStatusCode.ERROR });
        requestSpan.end();
    });

    // The following awful code creates spikes in the request rate which makes for more interesting graphs
    // Joe Elliott did not write this. Do not check the blame.
    counter++;
    if (counter >= 3000) {
        counter = 0;
    }

    var nextReqIn;
    if (counter < 2000) {
        // Choose low values in the first minute of every 5-minute interval
        nextReqIn =  Math.floor(Math.random() * 50);
    } else {
        // Choose high values for the next 4 minutes
        nextReqIn = Math.floor(Math.random() * 1000) + 100;
    }

    // Sometime in the next two seconds, but larger than 100ms
    //const nextReqIn = (Math.random() * 1000) + 100;
    setTimeout(() => makeRequest(tracingObj, logEntry), nextReqIn);
};

let counter = 0;

(async () => {
    const tracingObj = await tracingUtils();
    logEntry = await logUtils(tracingObj);

    // Kick off four requests that cycle at regular intervals
    setTimeout(() => makeRequest(tracingObj, logEntry), 5000);
    setTimeout(() => makeRequest(tracingObj, logEntry), 6000);
    setTimeout(() => makeRequest(tracingObj, logEntry), 7000);
    setTimeout(() => makeRequest(tracingObj, logEntry), 8000);

    // Ensure the danger gauge gets reset every minute
    setInterval(() => {
        dangerGauge.set(0);
    }, 30000);

    // Listen to API connections for metrics scraping.
    app.listen(4001);
})();
