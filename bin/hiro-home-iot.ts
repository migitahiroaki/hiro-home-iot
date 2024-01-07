#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SwitchbotWebhookHandlerStack } from '../lib/switchbot-webhook-handler-stack';
import { PythonLayerStack } from '../lib/python-layer-stack';

const projectName = 'hiro-home-iot';

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT!,
  region: process.env.CDK_DEFAULT_REGION!,
};

const app = new cdk.App();

const pythonLayerStack = new PythonLayerStack(app, 'python-layer-stack', {
  env,
  projectName,
});

const switchbotWebhookHandlerName = 'switchbot-webhook-handler';

const switchbotWebhookHandlerStack = new SwitchbotWebhookHandlerStack(
  app,
  'switchbot-webhook-handler-stack',
  {
    env,
    projectName,
    switchbotWebhookHandlerName,
    ssmPathForKey: `/${switchbotWebhookHandlerName}/path-key`,
    lambdaEnvironment: {
      LOG_LEVEL: 'DEBUG',
      SSM_WEBHOOK_URL: `/${switchbotWebhookHandlerName}/webhook-url`,
    },
    lambdaLayers: [pythonLayerStack.postWebhookLayer],
  }
);
