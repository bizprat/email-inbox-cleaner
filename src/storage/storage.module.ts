import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { db } from './database.provider';

@Module({
  controllers: [StorageController],
  providers: [
    {
      provide: 'DATABASE',
      useValue: db,
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
