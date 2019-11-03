import { Module } from '@nestjs/common';
import { BackupDbController } from './backup-db.controller';
import { BackupDbService } from './backup-db.service';

@Module({
  controllers: [BackupDbController],
  providers: [BackupDbService],
})
export class BackupDbModule {}
