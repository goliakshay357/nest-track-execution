For testing:

npm i prometheus-api-metrics         

main.ts

```
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as _apiMetrics from 'prometheus-api-metrics';
const apiMetrics = _apiMetrics as any as typeof _apiMetrics.default;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    apiMetrics({
      durationBuckets: [0.005, 1, 2],
    }),
  );
  app.listen(3000);
}
bootstrap();

```
