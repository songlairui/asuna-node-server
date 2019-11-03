import { configLoader } from 'asuna-node-server';

const ConfigKeys = {
  TARGET_DB_HOST: "TARGET_DB_HOST",
  TARGET_DB_USER: "TARGET_DB_USER",
  TARGET_DB_PASSWORD: "TARGET_DB_PASSWORD",
  TARGET_DB_DATABASE: "TARGET_DB_DATABASE",
  AWS_AK: "AWS_AK",
  AWS_SK: "AWS_SK",
  AWS_REGION: "AWS_REGION",
  AWS_BUCKET: "AWS_BUCKET",
}


export const connection = {
  host: configLoader.loadConfig(ConfigKeys.TARGET_DB_HOST),
  user: configLoader.loadConfig(ConfigKeys.TARGET_DB_USER),
  password: configLoader.loadConfig(ConfigKeys.TARGET_DB_PASSWORD),
  database: configLoader.loadConfig(ConfigKeys.TARGET_DB_DATABASE),
};

export const awsConfig = {
  accessKeyId: configLoader.loadConfig(ConfigKeys.AWS_AK),
  secretAccessKey: configLoader.loadConfig(ConfigKeys.AWS_SK),
  region: configLoader.loadConfig(ConfigKeys.AWS_REGION),
  bucket: configLoader.loadConfig(ConfigKeys.AWS_BUCKET),
}