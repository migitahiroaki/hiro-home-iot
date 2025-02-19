import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { CommonProps } from '../interface/common-props';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { NameUtil } from './util/name-util';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

interface SnsNotificationSetting {
  readonly subscriberAddresses?: string[];
  readonly notifyLambda?: lambda.IFunction;
}
interface SnsTopicProps extends CommonProps {
  snsNotificationSettings: { [suffix: string]: SnsNotificationSetting };
}

export class SnsNotificationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SnsTopicProps) {
    super(scope, id, props);
    for (const [suffix, setting] of Object.entries(
      props.snsNotificationSettings
    )) {
      const topicName = NameUtil.generateName(
        props.projectName,
        'Topic',
        suffix
      );
      const topic = new sns.Topic(this, topicName, {
        topicName,
        displayName: topicName,
        fifo: false,
      });
      setting.subscriberAddresses?.forEach(
        (addr) => new EmailSubscription(addr)
      );

      setting.notifyLambda?.addEventSource(new SnsEventSource(topic));
    }
  }
}
