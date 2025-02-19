import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { CommonProps } from '../interface/common-props';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

export interface BillingNotificationStackProps extends CommonProps {
  notifyLambda?: IFunction;
  subscriberAddresses?: string[];
}

export class BillingNotificationStack extends cdk.Stack {
  billingTopic: sns.Topic;
  constructor(
    scope: Construct,
    id: string,
    props: BillingNotificationStackProps
  ) {
    super(scope, id, props);
  }
}
