import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IndexerService } from './indexer.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IndexerScheduler {
  private readonly logger = new Logger(IndexerScheduler.name);

  constructor(
    private indexerService: IndexerService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleIndexing() {
    try {
      // Check if indexer is enabled
      if (process.env.INDEXER_ENABLED !== 'true') {
        return;
      }

      // Check if already running
      const state = await this.prisma.indexerState.findFirst();
      if (state?.isRunning) {
        this.logger.debug('Indexer already running, skipping...');
        return;
      }

      // Mark as running
      await this.prisma.indexerState.upsert({
        where: { id: '1' },
        create: {
          id: '1',
          isRunning: true,
        },
        update: {
          isRunning: true,
        },
      });

      const blocksToIndex = await this.indexerService.getBlocksToIndex();

      if (blocksToIndex.length === 0) {
        await this.prisma.indexerState.updateMany({
          data: { isRunning: false },
        });
        return;
      }

      this.logger.log(`Indexing ${blocksToIndex.length} blocks (${blocksToIndex[0]} to ${blocksToIndex[blocksToIndex.length - 1]})`);

      for (const blockNumber of blocksToIndex) {
        try {
          await this.indexerService.indexBlock(blockNumber);
        } catch (error) {
          this.logger.error(`Error indexing block ${blockNumber}: ${error.message}`);
          // Continue with next block
        }
      }

      // Note: Metrics recalculation happens separately via cron job
      // to avoid circular dependencies

      // Mark as not running
      await this.prisma.indexerState.updateMany({
        data: { isRunning: false },
      });

      this.logger.log(`Successfully indexed ${blocksToIndex.length} blocks`);
    } catch (error) {
      this.logger.error(`Error in indexer scheduler: ${error.message}`);
      await this.prisma.indexerState.updateMany({
        data: { isRunning: false, errorMessage: error.message },
      });
    }
  }

}

