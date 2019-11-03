import { Controller } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { BackupDbService } from './backup-db.service';
import * as AWS from 'aws-sdk';

@Controller('backup-db')
export class BackupDbController {
  constructor(private readonly service: BackupDbService) {}
  @MessagePattern({ cmd: 'backup-mysql' })
  async backup(tables?: string[], to?: string): Promise<any> {
    const dumpstr = await this.service.backup(tables);
    switch (to) {
      case 's3':
        return await this.service.uploadToS3(dumpstr);
      case 'download':
      default:
        return { dumpstr };
    }
  }
  @MessagePattern({ cmd: 'list-s3-backups' })
  async listS3Backups(maxKeys?: number, prefix?: string): Promise<AWS.S3.ListObjectsV2Output> {
    return this.service.listS3Backups(maxKeys, prefix);
  }

  @MessagePattern({ cmd: 'get-s3-backup' })
  async getS3Backup(key: string): Promise<AWS.S3.GetObjectOutput> {
    return this.service.getS3Backup(key);
  }
}
