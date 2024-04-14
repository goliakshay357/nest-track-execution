import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { finalize, Observable } from 'rxjs';
import { CustomMetricSingleton } from '../wrappers/custom-metrics.singleton';
import { TRACK_EXECUTION_TIME_KEY } from '../decorators/track-execution-time.decorator';

@Injectable()
export class ExecutionTimeInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const classTrackExecutionTime = this.reflector.get<boolean>(
      TRACK_EXECUTION_TIME_KEY,
      context.getClass(),
    );
    const methodTrackExecutionTime = this.reflector.get<boolean>(
      TRACK_EXECUTION_TIME_KEY,
      context.getHandler(),
    );

    if (!classTrackExecutionTime && !methodTrackExecutionTime) {
      return next.handle();
    }

    const now = Date.now();
    return next.handle().pipe(
      finalize(() => {
        const executionTime = Date.now() - now;
        const className = context.getClass().name;
        const methodName = context.getHandler().name;
        const metrics = CustomMetricSingleton.getMetrics();

        // Observing function execution time
        metrics.observeFunctionExecutionTime(
          className,
          methodName,
          executionTime,
        );
      }),
    );
  }
}
