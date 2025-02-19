import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { CommonProps } from '../interface/common-props';
import { LambdaSetting } from '../interface/lambda-props';
import { LambdaFunction } from './fragment/lambda-function';
import { PolicyGeneratorUtil } from './util/policy-generator-util';
import { NameUtil } from './util/name-util';

export interface NotifyDiscordLambdaStackProps extends CommonProps {
  readonly lambdaSetting: LambdaSetting;
  // readonly ssmDiscord: string;
}

export class NotifyDiscordLambdaStack extends cdk.Stack {
  alexaLambdaFunction: lambda.IFunction;
  constructor(
    scope: Construct,
    id: string,
    props: NotifyDiscordLambdaStackProps
  ) {
    super(scope, id, props);

    const lambdaRoleName = NameUtil.generateName(
      props.projectName,
      'Role',
      'NotifyDiscord'
    );
    const lambdaRole = new iam.Role(
      this,
      lambdaRoleName,
      PolicyGeneratorUtil.rolePropsForLambda(lambdaRoleName)
    );

    const lambdaFunction = new LambdaFunction(this, {
      parentStackProps: props,
      suffix: 'NotifyDiscord',
      role: lambdaRole,
      lambdaSetting: props.lambdaSetting,
    });
  }
}
