import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get(/^\/(?!api|survey).*/, (req, res) => {
    res.sendFile(
      join(__dirname, '..', '..', 'frontend', 'site', 'dist', 'index.html'),
    );
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
