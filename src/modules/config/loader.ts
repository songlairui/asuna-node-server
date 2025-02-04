import { ConfigLoader, createConfigLoader } from 'node-buffs';
import { LoggerFactory } from '../common/logger/factory';

const logger = LoggerFactory.getLogger('ConfigLoader');

export const ConfigKeys = {
  ADMIN_SECRET_KEY: 'ADMIN_SECRET_KEY',
  SECRET_KEY: 'SECRET_KEY',
  AUDIT: 'AUDIT',
  DEBUG: 'DEBUG',
  SWAGGER: 'SWAGGER',
  PORT: 'PORT',
  TRACING: 'TRACING',
  DB_TYPE: 'DB_TYPE',
  UPLOADER_MAX_COUNT: 'UPLOADER_MAX_COUNT',

  LOGGER_LEVEL: 'LOGGER_LEVEL',
  MASTER_ADDRESS: 'MASTER_ADDRESS',

  /**
   * 用与访问上传文件的资源地址
   */
  RESOURCE_PATH: 'RESOURCE_PATH',
  ASSETS_ENDPOINT: 'ASSETS_ENDPOINT',
  ASSETS_INTERNAL_ENDPOINT: 'ASSETS_INTERNAL_ENDPOINT',

  VIDEOS_STORAGE: 'VIDEOS_STORAGE',
  IMAGES_STORAGE: 'IMAGES_STORAGE',
  FILES_STORAGE: 'FILES_STORAGE',
  CHUNKS_STORAGE: 'CHUNKS_STORAGE',

  MAIL_HOST: 'MAIL_HOST',
  MAIL_PORT: 'MAIL_PORT',
  MAIL_SSL: 'MAIL_SSL',
  MAIL_USERNAME: 'MAIL_USERNAME',
  MAIL_PASSWORD: 'MAIL_PASSWORD',
  MAIL_FROM: 'MAIL_FROM',

  // WS_REDIS_HOST: 'WS_REDIS_HOST',
  // WS_REDIS_PORT: 'WS_REDIS_PORT',
  // WS_REDIS_PASSWORD: 'WS_REDIS_PASSWORD',
  WS_REDIS_ENABLE: 'WS_REDIS_ENABLE',
  WS_REDIS_DB: 'WS_REDIS_DB',

  JOB_REDIS_ENABLE: 'JOB_REDIS_ENABLE',
  JOB_REDIS_DB: 'JOB_REDIS_DB',

  // ACTION_CACHE_HOST: 'ACTION_CACHE_HOST',
  // ACTION_CACHE_PORT: 'ACTION_CACHE_PORT',
  // ACTION_CACHE_PASSWORD: 'ACTION_CACHE_PASSWORD',
  // ACTION_CACHE_DB: 'ACTION_CACHE_DB',
  // ACTION_CACHE_DURATION: 'ACTION_CACHE_DURATION',
  PAYLOAD_LIMIT: 'PAYLOAD_LIMIT',

  OTP_SECRET: 'OTP_SECRET',
};

export const configLoader: ConfigLoader = createConfigLoader({
  requiredVariables: [],
});

// logger.log(`NODE_ENV: ${util.inspect(configLoader.loadConfigs())}`);
logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
logger.log(`ENV: ${process.env.ENV}`);
