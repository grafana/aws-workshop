const { trace, context } = require('@opentelemetry/api');

// It seems that auto-instrumentation creates a Span, but it doesn't give it a parent, because it isn't aware of the SQS message.

exports.handler = async (event, context) => {
    console.log(JSON.stringify(event));
    const recordCount = event.Records.length;
    const attributes = {
        'messaging.system': 'aws_sqs',
        'messaging.operation.name': 'process', // Where: "One or more messages are processed by a consumer"
        'messaging.operation.type': 'process', // Where: "One or more messages are processed by a consumer"
        'messaging.batch.message_count': recordCount,
    }
    for (const message of event.Records) {
        await processMessageAsync(message, attributes);
    }
    console.info("done");
};

async function processMessageAsync(message, attributes) {
    const tracer = trace.getTracer('lambda-sqs-processor');

    // Extract trace context from SQS message attributes
    const parentContext = extractTraceContext(message);

    const destination = message.eventSourceARN?.split(':').pop();

    // Start a new span linked to the parent trace
    // A single “Process” or “Receive” span can account for a single message, for a batch of messages, or for no message at all (if it is signalled that no messages were received)
    const span = tracer.startSpan(`process ${destination}`, { // https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/#span-name
        kind: 1, // CONSUMER

        attributes: {
            ...attributes,
            'messaging.message.id': message.messageId ,
            'messaging.destination.name': destination,
        },
        // attributes: {
        //     'messaging.system': 'aws_sqs',
        //     'messaging.destination.name': destination,
        //     'messaging.operation.name': 'process', // Where: "One or more messages are processed by a consumer"
        //     'messaging.operation.type': 'process', // Where: "One or more messages are processed by a consumer"
        //     'messaging.message.id': message.messageId
        // }
    }, parentContext);

    try {
        await context.with(trace.setSpan(context.active(), span), async () => {
            const messageBody = message.body;

            console.log(`Received a message: ${messageBody}`);

            // Simulate work processing time
            const workTime = (Math.random() * 30) + 20;
            await new Promise(resolve => setTimeout(resolve, workTime));
        });

        span.setStatus({ code: 1 }); // OK
    } catch (err) {
        span.setStatus({ code: 2, message: err.message }); // ERROR
        span.recordException(err);
        console.error("An error occurred processing message:", err);
        throw err;
    } finally {
        span.end();
    }
}

function extractTraceContext(message) {
    try {
        // Extract traceparent from SQS message attributes
        const traceparent = message.messageAttributes?.traceparent?.stringValue;

        if (!traceparent) {
            return context.active();
        }

        // Parse traceparent header (format: 00-traceId-spanId-flags)
        const parts = traceparent.split('-');
        if (parts.length !== 4) {
            return context.active();
        }

        const [version, traceId, parentSpanId, flags] = parts;

        // Create trace context from the parent
        const traceContext = trace.setSpanContext(context.active(), {
            traceId,
            spanId: parentSpanId,
            traceFlags: parseInt(flags, 16),
            isRemote: true
        });

        return traceContext;
    } catch (err) {
        console.warn('Failed to extract trace context:', err);
        return context.active();
    }
}
