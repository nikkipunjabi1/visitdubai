const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (_key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  };
};

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { BatchSpanProcessor } = await import('@opentelemetry/sdk-trace-node');
    const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics');
    const { createWriteStream } = await import('fs');
    const { join } = await import('path');

    const logFile = join(process.cwd(), 'otel-output.log');
    const logStream = createWriteStream(logFile, { flags: 'a' });

    const createFileExporter = (label: string) => ({
      export(data: any, resultCallback: (result: { code: number }) => void): void {
        try {
          const safeData = JSON.stringify(data, getCircularReplacer());
          logStream.write(`\n--- ${label} ---\n${safeData}\n`);
        } catch (error) {
          logStream.write(`\n--- ${label} ERROR ---\n${String(error)}\n`);
        }
        resultCallback({ code: 0 });
      },
      forceFlush: () => Promise.resolve(),
      shutdown: () => logStream.end(),
    });

    const sdk = new NodeSDK({
      spanProcessor: new BatchSpanProcessor(createFileExporter('SPANS') as any),
      metricReader: new PeriodicExportingMetricReader({
        exporter: createFileExporter('METRICS') as any,
      }),
    });

    sdk.start();
  }
}
