import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from './wallet/wallet.module';
import { NetworkModule } from './network/network.module';
import { IndexerModule } from './indexer/indexer.module';
import { MetricsModule } from './metrics/metrics.module';
import { PrismaModule } from './prisma/prisma.module';
import { RpcModule } from './rpc/rpc.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RpcModule,
    MetricsModule,
    WalletModule,
    NetworkModule,
    IndexerModule,
  ],
})
export class AppModule {}

