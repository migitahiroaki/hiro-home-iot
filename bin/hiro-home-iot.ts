#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SwitchbotWebhookHandlerStack } from '../lib/switchbot-webhook-handler-stack';

const projectName = 'hiro-home-iot';

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT!,
  region: process.env.CDK_DEFAULT_REGION!,
};

const app = new cdk.App();
const switchbotWebhookHandlerStack = new SwitchbotWebhookHandlerStack(
  app,
  'switchbot-webhook-handler-stack',
  {
    env,
    projectName,
    ssmPathForKey: '/switchbot-webhook-handler/path-key',
    lambdaEnvironment: {
      LOG_LEVEL: 'DEBUG',
    },
  }
);
