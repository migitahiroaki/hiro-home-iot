#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { SwitchbotWebhookHandlerStack } from '../lib/switchbot-webhook-handler-stack';
import { PythonLayerStack } from '../lib/python-layer-stack';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { AlexaLambdaStack } from '../lib/alexa-lambda-stack';
import { SsmParameterStack } from '../lib/ssm-parameter-stack';
import { NotifyDiscordLambdaStack } from '../lib/notify-discord-lambda-stack';

const projectName = 'hiro-home-iot';

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT!,
  region: process.env.CDK_DEFAULT_REGION!,
};

const ssmLayerAlexaScraperLibsArn = '/layer/alexa_scraper_libs/arn';
const ssmLayerPostWebhookArn = '/layer/post_webhook/arn';
const ssmLayerResolveParamArn = '/layer/resolve_param/arn';
const ssmAlexaKnachuBusSkillId = '/alexa/kanachu-bus/skillId';
const ssmAlexaKanachuBusTargetUrl = '/alexa/kanachu-bus/targetUrl';
const ssmSwitchbotWebhookHandlerPathKey = '/switchbot-webhook-handler/path-key';
const ssmSwitchbotWebhookHandlerPostDestination =
  '/switchbot-webhook-handler/post-destination';

const app = new cdk.App();

const ssmParameterStack = new SsmParameterStack(app, 'ssm-parameter-stack', {
  env,
  projectName,
  parameterDefinitions: {
    [ssmLayerAlexaScraperLibsArn]: {},
    [ssmLayerPostWebhookArn]: {},
    [ssmLayerResolveParamArn]: {},
    [ssmSwitchbotWebhookHandlerPathKey]: {},
    [ssmAlexaKnachuBusSkillId]: {},
  },
});

const pythonLayerStack = new PythonLayerStack(app, 'python-layer-stack', {
  env,
  projectName,
  postWebhookLayerAssetPath: './python-lambda/layer/post_webhook',
  alexaScraperLibsLayerPath: './python-lambda/layer/alexa_scraper_libs',
  resolveParamLayerAssetPath: './python-lambda/layer/resolve_param',
  runtimeProps: {
    compatibleRuntimes: [lambda.Runtime.PYTHON_3_10],
    compatibleArchitectures: [lambda.Architecture.X86_64],
  },
});

const notifyDiscordLambdaStack = new NotifyDiscordLambdaStack(
  app,
  'notify-lambda-discord-stack',
  {
    env,
    projectName,
    lambdaSetting: {
      handler: 'lambda_function.lambda_handler',
      environment: {
        PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL: 'debug',
      },
      managedLayerArns: [
        'arn:aws:lambda:ap-northeast-1:133490724326:layer:AWS-Parameters-and-Secrets-Lambda-Extension:11',
      ],
      ssmParamsForlayerArn: [],
      code: lambda.AssetCode.fromAsset(`./python-lambda/notify_discord`),
      runtime: lambda.Runtime.PYTHON_3_10,
      architecture: lambda.Architecture.X86_64,
      logRetention: RetentionDays.ONE_MONTH,
    },
  }
);

const switchbotWebhookHandlerName = 'switchbot-webhook-handler';

const switchbotWebhookHandlerStack = new SwitchbotWebhookHandlerStack(
  app,
  'switchbot-webhook-handler-stack',
  {
    env,
    projectName,
    ssmPathKey: ssmSwitchbotWebhookHandlerPathKey,
    switchbotWebhookHandlerName,
    ssmPostDestination: ssmSwitchbotWebhookHandlerPostDestination,
    lambdaSetting: {
      handler: 'lambda_function.lambda_handler',
      environment: {
        LOG_LEVEL: 'DEBUG',
        SSM_WEBHOOK_URL: ssmSwitchbotWebhookHandlerPostDestination,
        // PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL: 'debug',
      },
      managedLayerArns: [
        'arn:aws:lambda:ap-northeast-1:133490724326:layer:AWS-Parameters-and-Secrets-Lambda-Extension:11',
      ],
      ssmParamsForlayerArn: [ssmLayerPostWebhookArn, ssmLayerResolveParamArn],
      code: lambda.AssetCode.fromAsset('./asset/'),
      runtime: lambda.Runtime.PYTHON_3_10,
      architecture: lambda.Architecture.X86_64,
      // permissionSettings: {},
      logRetention: RetentionDays.ONE_MONTH,
    },
  }
);

const alexaLambdaStack = new AlexaLambdaStack(app, 'alexa-lambda-stack', {
  env,
  projectName,
  ssmAlexaSkillId: ssmAlexaKnachuBusSkillId,
  ssmAlexaKanachuBusTargetUrl,
  lambdaSetting: {
    handler: 'lambda_function.lambda_handler',
    environment: {
      SSM_URL: ssmAlexaKanachuBusTargetUrl,
      // PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL: 'debug',
    },
    managedLayerArns: [
      'arn:aws:lambda:ap-northeast-1:133490724326:layer:AWS-Parameters-and-Secrets-Lambda-Extension:11',
    ],
    ssmParamsForlayerArn: [
      ssmLayerAlexaScraperLibsArn,
      ssmLayerResolveParamArn,
    ],
    code: lambda.AssetCode.fromAsset('python-lambda/kanachu-bus/', {
      exclude: ['test', '.pytest_cache'],
    }),
    runtime: lambda.Runtime.PYTHON_3_10,
    architecture: lambda.Architecture.X86_64,
    // permissionSettings: {},
    logRetention: RetentionDays.ONE_MONTH,
  },
});
