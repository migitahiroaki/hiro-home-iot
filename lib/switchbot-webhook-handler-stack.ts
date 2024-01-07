import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { CommonProps } from '../interface/common-props';

export interface SwitchbotWebhookHandlerStackProps extends CommonProps {
  readonly projectName: string;
  readonly ssmPathForKey: string;
  readonly switchbotWebhookHandlerName?: string;
  readonly lambdaEnvironment?: { [key: string]: string };
  readonly lambdaLayers: lambda.LayerVersion[];
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
    const apiName = `${projectName}-HttpApi-${switchbotWebhookHandlerName}`;

    const api = new apigateway.HttpApi(this, apiName, {
      apiName,
      disableExecuteApiEndpoint: false,
    });

    const lambdaFunctionName = `${projectName}-${switchbotWebhookHandlerName}-Function`;
    const lambdaRoleName = `${projectName}-Role-WebhookHandlerFunction`;
    const lambdaRole = new iam.Role(this, lambdaRoleName, {
      roleName: lambdaRoleName,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        GetParameters: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['ssm:DescribeParameters'],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['ssm:GetParameter'],
              resources: [
                `arn:aws:ssm:${props.env.region!}:${props.env
                  .account!}:parameter/${switchbotWebhookHandlerName}/*`,
              ],
            }),
          ],
        }),
      },
    });

    const lambdaFunction = new lambda.Function(this, lambdaFunctionName, {
      functionName: lambdaFunctionName,
      code: lambda.AssetCode.fromAsset('./asset/switchbot-webhook-handler'),
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'lambda_function.lambda_handler',
      logRetention: logs.RetentionDays.ONE_MONTH,
      environment: props.lambdaEnvironment,
      layers: props.lambdaLayers,
      role: lambdaRole,
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
        `${projectName}-LambdaIntegration-${switchbotWebhookHandlerName}`,
        lambdaFunction
      ),
    });
  }
}
