import { Environment, StackProps } from 'aws-cdk-lib';

export interface CommonProps extends StackProps {
  projectName: string;
  env: Environment;
}
