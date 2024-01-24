import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { CommonProps } from '../interface/common-props';

interface RuntimeProps {
  readonly compatibleRuntimes: lambda.Runtime[];
  readonly compatibleArchitectures: lambda.Architecture[];
}
export interface PythonLayerStackProps extends CommonProps {
  readonly postWebhookLayerAssetPath: string;
  readonly alexaScraperLibsLayerPath: string;
  readonly resolveParamLayerAssetPath: string;
  readonly runtimeProps: RuntimeProps;
}

export class PythonLayerStack extends cdk.Stack {
  postWebhookLayer: lambda.LayerVersion;
  alexaScraperLibsLayer: lambda.LayerVersion;
  resolveParamLayer: lambda.LayerVersion;

  constructor(scope: Construct, id: string, props: PythonLayerStackProps) {
    super(scope, id, props);

    const postWebhookLayerName = `${props.projectName}-Layer-PostWebhook`;
    this.postWebhookLayer = new lambda.LayerVersion(
      this,
      postWebhookLayerName,
      {
        layerVersionName: postWebhookLayerName,
        code: lambda.Code.fromAsset(props.postWebhookLayerAssetPath),
        ...props.runtimeProps,
      }
    );

    const alexaScraperLibsLayerName = `${props.projectName}-Layer-AlexaScraperLibs`;
    this.alexaScraperLibsLayer = new lambda.LayerVersion(
      this,
      alexaScraperLibsLayerName,
      {
        layerVersionName: alexaScraperLibsLayerName,
        code: lambda.Code.fromAsset(props.alexaScraperLibsLayerPath),
        ...props.runtimeProps,
      }
    );

    const resolveParamLayerName = `${props.projectName}-Layer-ResolveParam`;
    this.resolveParamLayer = new lambda.LayerVersion(
      this,
      resolveParamLayerName,
      {
        layerVersionName: resolveParamLayerName,
        code: lambda.Code.fromAsset(props.resolveParamLayerAssetPath),
        ...props.runtimeProps,
      }
    );
  }
}
