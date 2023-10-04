import { Handler, Context } from 'aws-lambda';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
// const { createServer, proxy } = require('aws-serverless-express');
import { eventContext } from 'aws-serverless-express/middleware';

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

import * as express from 'express';
import { runMigration } from './sequelize.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const binaryMimeTypes: string[] = [];

let cachedSwaggerServer: Server;

async function bootstrapSwagger(): Promise<Server> {
  if (!cachedSwaggerServer) {
    const stage = process.env.SERVERLESS_STAGE || 'dev';

    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    // app.setGlobalPrefix(stage);
    const config = new DocumentBuilder()
      .setTitle('BlogApp API Doc')
      .setDescription('The official API BlogApp Documentation')
      .setVersion('1.0')
      .addTag('BlogApp')
      // .addServer(stage)
      .addBearerAuth({
        name: 'Authorization',
        type: 'http',
        bearerFormat: 'JWT',
        scheme: 'Bearer',
        in: 'header',
        description: `JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.`,
      })
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
    app.enableCors();
    app.use(eventContext());
    await app.init();
    cachedSwaggerServer = createServer(expressApp, undefined, binaryMimeTypes);
  }
  return cachedSwaggerServer;
}

export const lambda_handler: Handler = async (event: any, context: Context) => {
  // cachedServer = await bootstrapServer();
  // event.path = event.path.includes('api-docs') ? `/api-docs/` : event.path;
  cachedSwaggerServer = await bootstrapSwagger();
  return proxy(cachedSwaggerServer, event, context, 'PROMISE').promise;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const lambda_migrate: Handler = async (event: any, context: Context) => {
  const isSuccessful = await runMigration();

  if (isSuccessful) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Migration was successful' }),
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Migration failed' }),
    };
  }
};
