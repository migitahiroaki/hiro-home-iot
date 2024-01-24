import { Effect, PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';

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
}
