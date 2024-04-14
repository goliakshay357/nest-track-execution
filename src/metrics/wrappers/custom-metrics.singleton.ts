import * as Prometheus from 'prom-client';

export class CustomMetricSingleton {
  readonly metrics: {
    functionExecutionTime: Prometheus.Histogram;
  };

  static instance: CustomMetricSingleton;

  private constructor() {
    if (process.env.DISABLE_CUSTOM_METRICS === 'true') {
      return;
    }
    this.metrics = {
      functionExecutionTime: new Prometheus.Histogram({
        name: 'function_execution_time_milliseconds',
        help: 'Execution time of functions',
        labelNames: ['className', 'methodName'],
        buckets: [
          0.1, 0.25, 1, 2, 5, 10, 15, 25, 50, 100, 200, 500, 1000, 2000, 5000,
          10000, 20000, 30000, 40000, 50000,
        ],
      }),
    };
  }

  static getMetrics() {
    if (!CustomMetricSingleton.instance) {
      CustomMetricSingleton.instance = new CustomMetricSingleton();
    }
    return CustomMetricSingleton.instance;
  }

  // Method to observe function execution times
  observeFunctionExecutionTime(
    className: string,
    methodName: string,
    executionTime: number,
  ) {
    this.metrics.functionExecutionTime.observe(
      { className, methodName },
      executionTime,
    );
  }
}
