import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { CommonProps } from '../interface/common-props';
import { LambdaSetting } from '../interface/lambda-props';
import { PolicyGeneratorUtil } from './util/policy-generator-util';
import { LambdaFunction } from './fragment/lambda-function';

export interface SwitchbotWebhookHandlerStackProps extends CommonProps {
  readonly projectName: string;
  readonly ssmPathKey: string;
  readonly ssmPostDestination: string;
  readonly switchbotWebhookHandlerName: string;
  readonly lambdaSetting: LambdaSetting;
}

export class SwitchbotWebhookHandlerStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: SwitchbotWebhookHandlerStackProps
  ) {
    super(scope, id, props);

    const apiName = `${props.projectName}-HttpApi-${props.switchbotWebhookHandlerName}`;
    const httpApi = new apigateway.HttpApi(this, apiName, {
      apiName,
      disableExecuteApiEndpoint: false,
    });

    const lambdaFunctionName = `${props.projectName}-${props.switchbotWebhookHandlerName}-Function`;
    const lambdaRoleName = `${props.projectName}-Role-WebhookHandlerFunction`;
    const lambdaRole = new iam.Role(this, lambdaRoleName, {
      roleName: lambdaRoleName,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        readParameters: PolicyGeneratorUtil.ssmParameterReadPolicy(
          props.env.account!,
          props.env.region!,
          [props.ssmPostDestination]
        ),
      },
    });

    const lambdaFunction = new LambdaFunction(this, {
      parentStackProps: props,
      suffix: props.switchbotWebhookHandlerName,
      role: lambdaRole,
      lambdaSetting: props.lambdaSetting,
    }).constructedLambda;

    // switchbot-webhookはヘッダなど登録できないので特定のパスパラメータを持ってないと弾くようにする(妥協)

    const httpRoute = new apigateway.HttpRoute(this, 'Route', {
      httpApi: httpApi,
      routeKey: apigateway.HttpRouteKey.with(
        `/switchbot/${StringParameter.valueForStringParameter(
          this,
          props.ssmPathKey
        )}`,
        apigateway.HttpMethod.POST
      ),
      integration: new integrations.HttpLambdaIntegration(
        `${props.projectName}-LambdaIntegration-${props.switchbotWebhookHandlerName}`,
        lambdaFunction
      ),
    });
  }
}
