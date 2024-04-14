import { Module } from '@nestjs/common';
import { ExecutionTimeInterceptor } from './metrics/interceptors/execution-time.interceptor';

@Module({
  providers: [ExecutionTimeInterceptor],
  exports: [ExecutionTimeInterceptor],
})
export class MetricsModule {}
