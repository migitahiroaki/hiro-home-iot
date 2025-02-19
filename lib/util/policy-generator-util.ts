import {
  Effect,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';

export class PolicyGeneratorUtil {
  public static ssmParameterReadPolicy(
    accountId: string,
    region: string,
    parameterNames: string[]
  ): PolicyDocument {
    const describeParameterPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ssm:DescribeParameters'],
      resources: ['*'],
    });
    const getParameterPolicies = parameterNames.map((name) => {
      return new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${region}:${accountId}:parameter/${name.replace(
            /^\//,
            ''
          )}`,
        ],
      });
    });
    return new PolicyDocument({
      statements: [describeParameterPolicy].concat(getParameterPolicies),
    });
  }

  public static rolePropsForLambda(roleName: string) {
    return {
      roleName: roleName,
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      // inlinePolicies: {},
    };
  }
}
