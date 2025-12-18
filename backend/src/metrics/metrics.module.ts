import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsScheduler } from './metrics.scheduler';
import { RpcModule } from '../rpc/rpc.module';

@Module({
  imports: [RpcModule],
  providers: [MetricsService, MetricsScheduler],
  exports: [MetricsService],
})
export class MetricsModule {}

