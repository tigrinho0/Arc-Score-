import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { IndexerScheduler } from './indexer.scheduler';
import { RpcModule } from '../rpc/rpc.module';

@Module({
  imports: [RpcModule],
  providers: [IndexerService, IndexerScheduler],
  exports: [IndexerService],
})
export class IndexerModule {}

