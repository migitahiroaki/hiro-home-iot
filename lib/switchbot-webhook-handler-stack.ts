import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export interface SwitchbotWebhookHandlerStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly ssmPathForKey: string;
  readonly switchbotWebhookHandlerName?: string;
  readonly lambdaEnvironment?: { [key: string]: string };
}

export class SwitchbotWebhookHandlerStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: SwitchbotWebhookHandlerStackProps
  ) {
    super(scope, id, props);

    const projectName = 'hiro-home-iot';
    const switchbotWebhookHandlerName =
      props?.switchbotWebhookHandlerName ?? 'switchbot-webhook-handler';
    const apiName = `${projectName}-${switchbotWebhookHandlerName}-HttpApi`;

    const api = new apigateway.HttpApi(this, apiName, {
      apiName,
      disableExecuteApiEndpoint: false,
    });

    const lambdaFunctionName = `${projectName}-${switchbotWebhookHandlerName}-Function`;

    const lambdaFunction = new lambda.Function(this, lambdaFunctionName, {
      functionName: lambdaFunctionName,
      code: lambda.AssetCode.fromAsset('./asset/switchbot-webhook-handler'),
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'lambda_function.lambda_handler',
      logRetention: logs.RetentionDays.ONE_MONTH,
      environment: props?.lambdaEnvironment,
    });
    // switchbot-webhookはヘッダなど登録できないので特定のパスパラメータを持ってないと弾くようにする(妥協)
    api.addRoutes({
      // path: '/switchbot/gHiNOPYTUyJIpwx1Qy5p6F8tqwQmYECzksS3EoIrTSdf1tV78V5M8yf6vD1b6h3PYEfXRRgDIPFaW7NmqLrpieKYeEwB05DcvNkeN2N6tJBXrCvzbWRiPdR2BFaU2iaq',
      path: `/switchbot/${StringParameter.valueFromLookup(
        this,
        props.ssmPathForKey
      )}`,
      methods: [apigateway.HttpMethod.POST],
      // integration: new apigateway.HttpRouteIntegration(),
      integration: new integrations.HttpLambdaIntegration(
        `${projectName}-${switchbotWebhookHandlerName}-LambdaIntegration`,
        lambdaFunction
      ),
    });
  }
}
