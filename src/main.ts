import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable CORS
  app.enableCors();

  // Set global prefix for all routes
  app.setGlobalPrefix('ofgen/api');

  // Get the configuration service
  const configService = app.get(ConfigService);

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('Ofgen API')
    .setDescription('The Ofgen API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('/')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger under the global prefix path
  SwaggerModule.setup('ofgen/api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
      displayRequestDuration: true,
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Ofgen API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = configService.get<number>('PORT', 8000);
  await app.listen(port);

  // Log the URLs
  const logger = new Logger('Bootstrap');
  logger.log(`Server is running on: http://localhost:${port}`);
  logger.log(
    `API Documentation available at: http://localhost:${port}/ofgen/api/docs`,
  );
  logger.log(`API Base URL: http://localhost:${port}/ofgen/api`);

}
bootstrap();
