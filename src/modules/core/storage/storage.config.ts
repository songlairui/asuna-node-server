import { Logger } from '@nestjs/common';
import { Expose, Transform } from 'class-transformer';
import * as _ from 'lodash';
import { configLoader } from '../config.helper';

export const QiniuConfigKeys = {
  QINIU_ENABLE: 'QINIU_ENABLE',
  QINIU_ACCESS_KEY: 'QINIU_ACCESS_KEY',
  QINIU_SECRET_KEY: 'QINIU_SECRET_KEY',
  QINIU_BUCKET_NAME: 'QINIU_BUCKET_NAME',
  QINIU_PREFIX: 'QINIU_PREFIX',
  QINIU_DOMAIN: 'QINIU_DOMAIN',
};

export class QiniuConfigObject {
  static logger = new Logger('QiniuConfigObject');

  enable: boolean;
  bucket: string;
  prefix: string;
  domain: string;

  accessKey: string;
  @Expose({ name: 'with-secret-key', toPlainOnly: true })
  @Transform(value => !!value, { toPlainOnly: true })
  secretKey: string;

  constructor(partial: Partial<QiniuConfigObject>) {
    Object.assign(this, partial);
  }

  static load(prefix: 'videos' | 'images' | 'files' | 'chunks' | string = ''): QiniuConfigObject {
    const appendPrefix = prefix ? `${prefix}_`.toUpperCase() : '';
    this.logger.log(`load env: ${appendPrefix}${QiniuConfigKeys.QINIU_ENABLE}`);
    return new QiniuConfigObject({
      enable: configLoader.loadBoolConfig(`${appendPrefix}${QiniuConfigKeys.QINIU_ENABLE}`),
      bucket: configLoader.loadConfig(`${appendPrefix}${QiniuConfigKeys.QINIU_BUCKET_NAME}`),
      prefix: configLoader.loadConfig(`${appendPrefix}${QiniuConfigKeys.QINIU_PREFIX}`),
      domain: configLoader.loadConfig(`${appendPrefix}${QiniuConfigKeys.QINIU_DOMAIN}`),
      accessKey: configLoader.loadConfig(`${appendPrefix}${QiniuConfigKeys.QINIU_ACCESS_KEY}`),
      secretKey: configLoader.loadConfig(`${appendPrefix}${QiniuConfigKeys.QINIU_SECRET_KEY}`),
    });
  }

  static loadOr(
    prefix: 'videos' | 'images' | 'files' | 'chunks' | string = '',
  ): QiniuConfigObject | null {
    const appendPrefix = (prefix.length ? `${prefix}_` : '').toUpperCase();
    this.logger.log(`loadOr env: ${appendPrefix}${QiniuConfigKeys.QINIU_ENABLE}`);
    const enable = configLoader.loadBoolConfig(`${appendPrefix}${QiniuConfigKeys.QINIU_ENABLE}`);
    if (enable === true) {
      return QiniuConfigObject.load(prefix);
    }
    if (enable === false) {
      return null;
    }
    return Object.assign(
      QiniuConfigObject.load(),
      _.omitBy(QiniuConfigObject.load(prefix), _.isNull),
    );
  }
}

export const MinioConfigKeys = {
  MINIO_ENABLE: 'MINIO_ENABLE',
  MINIO_ENDPOINT: 'MINIO_ENDPOINT',
  MINIO_PORT: 'MINIO_PORT',
  MINIO_USE_SSL: 'MINIO_USE_SSL',
  MINIO_ACCESS_KEY: 'MINIO_ACCESS_KEY',
  MINIO_SECRET_KEY: 'MINIO_SECRET_KEY',
};

export class MinioConfigObject {
  static logger = new Logger('MinioConfigObject');

  enable: boolean;
  endpoint: string;
  port: number;
  useSSL: boolean;

  accessKey: string;
  @Expose({ name: 'with-secret-key', toPlainOnly: true })
  @Transform(value => !!value, { toPlainOnly: true })
  secretKey: string;

  constructor(partial: Partial<MinioConfigObject>) {
    Object.assign(this, partial);
  }

  static load(): MinioConfigObject {
    return new MinioConfigObject({
      enable: configLoader.loadBoolConfig(MinioConfigKeys.MINIO_ENABLE, false),
      endpoint: configLoader.loadConfig(MinioConfigKeys.MINIO_ENDPOINT, 'minio'),
      port: configLoader.loadNumericConfig(MinioConfigKeys.MINIO_PORT, 9000),
      useSSL: configLoader.loadBoolConfig(MinioConfigKeys.MINIO_USE_SSL, false),
      accessKey: configLoader.loadConfig(MinioConfigKeys.MINIO_ACCESS_KEY),
      secretKey: configLoader.loadConfig(MinioConfigKeys.MINIO_SECRET_KEY),
    });
  }
}
