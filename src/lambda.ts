import { Handler, Context } from 'aws-lambda';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

import * as express from 'express';
import { runMigration } from './sequelize.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const binaryMimeTypes: string[] = [];

let cachedServer: Server;
let cachedSwaggerServer: Server;

async function bootstrapServer(): Promise<Server> {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    nestApp.use(eventContext());
    await nestApp.init();
    cachedServer = createServer(expressApp, undefined, binaryMimeTypes);
  }
  return cachedServer;
}

async function bootstrapSwagger(): Promise<Server> {
  if (!cachedSwaggerServer) {
    const stage = process.env.SERVERLESS_STAGE || 'dev';

    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    app.setGlobalPrefix(stage);
    const config = new DocumentBuilder()
      .setTitle('BlogApp API Doc')
      .setDescription('The official API BlogApp Documentation')
      .setVersion('1.0')
      .addTag('BlogApp')
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
    app.use(eventContext());
    await app.init();
    cachedSwaggerServer = createServer(expressApp, undefined, binaryMimeTypes);
  }
  return cachedSwaggerServer;
}

export const handler: Handler = async (event: any, context: Context) => {
  cachedServer = await bootstrapServer();
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};

export const migrate: Handler = async (event: any, context: Context) => {
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

export const swagger: Handler = async (event: any, context: Context) => {
  cachedSwaggerServer = await bootstrapSwagger();
  return proxy(cachedSwaggerServer, event, context, 'PROMISE').promise;
};
