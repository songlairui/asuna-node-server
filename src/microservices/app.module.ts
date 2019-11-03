import { Module } from '@nestjs/common';
import { BackupDbModule } from './backup-db/backup-db.module';

@Module({
  imports: [BackupDbModule],
})
export class AppModule {}
