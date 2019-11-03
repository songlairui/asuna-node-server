import { Injectable } from '@nestjs/common';
import { connection, awsConfig } from '../config';
import mysqldump from 'mysqldump';
import * as AWS from 'aws-sdk';

const generateBackupKey = function() {
  return `db-${new Date().toISOString().slice(0, 16)}-${Math.random()
    .toString(36)
    .substr(2, 5)}.sql`;
};

const { bucket: targetBucket, ...config } = awsConfig;
AWS.config.update({ ...config });

@Injectable()
export class BackupDbService {
  s3: AWS.S3;
  constructor() {
    this.s3 = new AWS.S3();
  }
  async backup(tables?: string[]): Promise<string> {
    const result = await mysqldump({
      connection,
      dump: {
        ...(tables ? { tables } : null), // 按表备份，默认全部
      },
    });
    return Object.values(result.dump).join('\n\n');
  }
  listS3Backups(maxKeys = 2, prefix = ''): Promise<AWS.S3.ListObjectsV2Output> {
    const params = {
      Bucket: targetBucket,
      MaxKeys: maxKeys,
      Prefix: `db-${prefix}`,
    };
    return new Promise((resolve, reject) => {
      this.s3.listObjectsV2(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
  uploadToS3(dumpstr: string) {
    const backupKey = generateBackupKey();

    const params = {
      Bucket: targetBucket,
      Key: backupKey,
      Body: dumpstr,
    };

    return new Promise((resolve, reject) => {
      this.s3.putObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            backupKey,
            data,
          });
        }
      });
    });
  }
  getS3Backup(key: string): Promise<AWS.S3.GetObjectOutput> {
    const getparams = {
      Bucket: targetBucket,
      Key: key,
    };
    return new Promise((resolve, reject) => {
      this.s3.getObject(getparams, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
