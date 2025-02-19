import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

interface PermissionSetting {
  readonly sourceName: string;
  readonly principal: iam.IPrincipal;
  readonly ssmEventSourceToken: string;
}

export interface LambdaSetting {
  readonly handler: string;
  readonly code: lambda.Code;
  readonly runtime: lambda.Runtime;
  readonly architecture: lambda.Architecture;
  readonly environment: { [key: string]: string };
  readonly managedLayerArns: string[];
  readonly ssmParamsForlayerArn: string[];
  readonly logRetention: RetentionDays;
  // readonly permissionSettings: { [name: string]: PermissionSetting };
}
