import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { CommonProps } from '../interface/common-props';

// export interface PythonLayerStackProps extends CommonProps {}

export class PythonLayerStack extends cdk.Stack {
  postWebhookLayer: lambda.LayerVersion;

  constructor(scope: Construct, id: string, props: CommonProps) {
    super(scope, id, props);

    const layerName = `${props.projectName}-Layer-PostWebhook`;
    this.postWebhookLayer = new lambda.LayerVersion(this, layerName, {
      layerVersionName: layerName,
      code: lambda.Code.fromAsset('./asset/layer'),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_11],
      compatibleArchitectures: [lambda.Architecture.X86_64],
    });
  }
}
