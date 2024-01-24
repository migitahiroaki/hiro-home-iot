import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { LambdaSetting } from '../../interface/lambda-props';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { CommonProps } from '../../interface/common-props';

interface LambdaFunctionProps {
  readonly parentStackProps: CommonProps;
  readonly suffix: string;
  readonly role: iam.IRole;
  readonly lambdaSetting: LambdaSetting;
}

export class LambdaFunction {
  public lambdaFunction: lambda.Function;
  constructor(scope: Construct, props: LambdaFunctionProps) {
    const lambdaSetting = props.lambdaSetting;
    const lambdaFunctionName = `${props.parentStackProps.projectName}-Lambda-${props.suffix}`;
    const managedLayers = lambdaSetting.managedLayerArns.map((layerArn) => {
      return lambda.LayerVersion.fromLayerVersionArn(scope, layerArn, layerArn);
    });
    const customLayers = lambdaSetting.ssmParamsForlayerArn.map(
      (parameterName) => {
        const arn = StringParameter.valueForStringParameter(
          scope,
          parameterName
        );
        return lambda.LayerVersion.fromLayerVersionArn(scope, arn, arn);
      }
    );

    this.lambdaFunction = new lambda.Function(scope, lambdaFunctionName, {
      role: props.role,
      functionName: lambdaFunctionName,
      handler: lambdaSetting.handler,
      code: lambdaSetting.code,
      runtime: lambdaSetting.runtime,
      architecture: lambdaSetting.architecture,
      environment: lambdaSetting.environment,
      layers: managedLayers.concat(customLayers),
      logRetention: lambdaSetting.logRetention,
    });

    for (const [name, setting] of Object.entries(
      lambdaSetting.permissionSettings
    )) {
      this.lambdaFunction.addPermission(
        `${props.parentStackProps.projectName}-LambdaResourcePolicy-${name}`,
        {
          principal: new iam.ServicePrincipal('alexa-appkit.amazon.com'),
          eventSourceToken: StringParameter.valueForStringParameter(
            scope,
            setting.ssmEventSourceToken
          ),
        }
      );
    }
  }
}
