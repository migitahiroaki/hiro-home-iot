import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CommonProps } from '../interface/common-props';

interface ParameterOption {
  readonly isSecure?: boolean;
  readonly initialValue?: string;
  readonly dataType?: ssm.ParameterDataType;
  readonly description?: string;
}

export interface SsmParameterStackProps extends CommonProps {
  readonly parameterDefinitions: { [parameterName: string]: ParameterOption };
}

export class SsmParameterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SsmParameterStackProps) {
    super(scope, id, props);
    for (const [parameterName, option] of Object.entries(
      props.parameterDefinitions
    )) {
      if (option.isSecure) {
        throw 'creating SECURE_STRING type is not implemented by cloudformation';
      } else {
        new ssm.StringParameter(this, parameterName, {
          parameterName,
          stringValue: option.initialValue ?? 'dummy',
          dataType: option.dataType ?? ssm.ParameterDataType.TEXT,
          description: option.description,
        });
      }
    }
  }
}
