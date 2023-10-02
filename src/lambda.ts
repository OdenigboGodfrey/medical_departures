import { Handler, Context } from 'aws-lambda';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

import * as express from 'express';
import { runMigration } from './sequelize.config';
const binaryMimeTypes: string[] = [];

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  // if (!cachedServer) {
  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  nestApp.use(eventContext());
  await nestApp.init();
  cachedServer = createServer(expressApp, undefined, binaryMimeTypes);
  // }
  return cachedServer;
}

export const handler: Handler = async (event: any, context: Context) => {
  console.log('processing request');
  cachedServer = await bootstrapServer();
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};

export const migrate: Handler = async (event: any, context: Context) => {
  console.log('migrating');
  const isSuccessful = await runMigration();

  if (isSuccessful) {
    return {
      statusCode: 200, // HTTP 200 OK
      body: JSON.stringify({ message: 'Migration was successful' }),
    };
  } else {
    return {
      statusCode: 500, // HTTP 500 Internal Server Error
      body: JSON.stringify({ message: 'Migration failed' }),
    };
  }
};
