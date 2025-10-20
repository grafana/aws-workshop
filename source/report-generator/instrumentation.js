import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
    PeriodicExportingMetricReader,
    ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { detectResources } from '@opentelemetry/resources';
import { awsEc2Detector } from '@opentelemetry/resource-detector-aws';
import { envDetector, osDetector, hostDetector, processDetector } from '@opentelemetry/resources';

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const resource = await detectResources({
    detectors: [envDetector, osDetector, hostDetector, processDetector, awsEc2Detector],
});
await resource.waitForAsyncAttributes(); // Because AWS fetches metadata via HTTP, so we need to wait

const sdk = new NodeSDK({
    resource: resource,
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
    }),
    resourceDetectors: [envDetector, osDetector, hostDetector, processDetector, awsEc2Detector],
});

sdk.start();
