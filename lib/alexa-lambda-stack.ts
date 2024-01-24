import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { CommonProps } from '../interface/common-props';
import { LambdaSetting } from '../interface/lambda-props';
import { LambdaFunction } from './fragment/lambda-function';
import { PolicyGeneratorUtil } from './util/policy-generator-util';

export interface AlexaLambdaStackProps extends CommonProps {
  readonly ssmAlexaSkillId: string;
  readonly lambdaSetting: LambdaSetting;
  readonly ssmAlexaKanachuBusTargetUrl: string;
}

export class AlexaLambdaStack extends cdk.Stack {
  alexaLambdaFunction: lambda.IFunction;
  constructor(scope: Construct, id: string, props: AlexaLambdaStackProps) {
    super(scope, id, props);

    const lambdaRoleName = `${props.projectName}-Role-AlexaFunction`;
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
          [props.ssmAlexaKanachuBusTargetUrl]
        ),
      },
    });

    const lambdaFunction = new LambdaFunction(this, {
      parentStackProps: props,
      suffix: 'Alexa',
      role: lambdaRole,
      lambdaSetting: props.lambdaSetting,
    });
  }
}
