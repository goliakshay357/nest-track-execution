import 'reflect-metadata';
import { CustomMetricSingleton } from '../wrappers/custom-metrics.singleton';

export const TRACK_EXECUTION_TIME_KEY = 'trackExecutionTime';

export function TrackExecutionTime(): ClassDecorator {
  return function (constructor: Function) {
    Object.getOwnPropertyNames(constructor.prototype).forEach((methodName) => {
      if (methodName === 'constructor') {
        return;
      }

      const originalMethod = constructor.prototype[methodName];
      const methodRef = Reflect.getMetadata(
        'design:type',
        constructor.prototype,
        methodName,
      );

      constructor.prototype[methodName] = function (...args: any[]) {
        const startTime = Date.now();

        let result;
        try {
          result = originalMethod.apply(this, args);
        } catch (error) {
          recordExecutionTime(startTime, constructor.name, methodName);
          throw error;
        }

        const isPromise = result instanceof Promise;
        const finish = () =>
          recordExecutionTime(startTime, constructor.name, methodName);

        if (isPromise) {
          return result.finally(finish);
        } else {
          finish();
          return result;
        }
      };

      // Re-apply metadata to the new method to ensure NestJS's router can recognize it
      Reflect.defineMetadata(
        'design:type',
        methodRef,
        constructor.prototype,
        methodName,
      );
      copyRouteDecorators(originalMethod, constructor.prototype[methodName]);
    });
  };
}

function recordExecutionTime(
  startTime: number,
  className: string,
  methodName: string,
) {
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  const metrics = CustomMetricSingleton.getMetrics();
  metrics.observeFunctionExecutionTime(className, methodName, executionTime);
}

function copyRouteDecorators(originalMethod: Function, newMethod: Function) {
  const routeHandlerMetadataKeys = Reflect.getMetadataKeys(originalMethod);
  routeHandlerMetadataKeys.forEach((key) => {
    const metadataValue = Reflect.getMetadata(key, originalMethod);
    Reflect.defineMetadata(key, metadataValue, newMethod);
  });
}
