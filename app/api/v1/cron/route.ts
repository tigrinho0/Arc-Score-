import { NextRequest, NextResponse } from 'next/server';
import { getIndexerService } from '@/lib/services/indexer.service';
import { getMetricsService } from '@/lib/services/metrics.service';
import { prisma } from '@/lib/prisma';

// This endpoint can be called by Vercel Cron or external cron services
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verify cron secret if configured
    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const action = request.nextUrl.searchParams.get('action') || 'indexer';

    if (action === 'indexer') {
      // Run indexer
      if (process.env.INDEXER_ENABLED !== 'true') {
        return NextResponse.json({
          success: true,
          message: 'Indexer is disabled',
        });
      }

      const state = await prisma.indexerState.findFirst();
      if (state?.isRunning) {
        return NextResponse.json({
          success: true,
          message: 'Indexer already running, skipping...',
        });
      }

      await prisma.indexerState.upsert({
        where: { id: '1' },
        create: {
          id: '1',
          isRunning: true,
        },
        update: {
          isRunning: true,
        },
      });

      const indexerService = getIndexerService();
      const blocksToIndex = await indexerService.getBlocksToIndex();

      if (blocksToIndex.length === 0) {
        await prisma.indexerState.updateMany({
          data: { isRunning: false },
        });
        return NextResponse.json({
          success: true,
          message: 'No blocks to index',
        });
      }

      console.log(
        `Indexing ${blocksToIndex.length} blocks (${blocksToIndex[0]} to ${blocksToIndex[blocksToIndex.length - 1]})`
      );

      for (const blockNumber of blocksToIndex) {
        try {
          await indexerService.indexBlock(blockNumber);
        } catch (error: any) {
          console.error(`Error indexing block ${blockNumber}: ${error.message}`);
          // Continue with next block
        }
      }

      await prisma.indexerState.updateMany({
        data: { isRunning: false },
      });

      return NextResponse.json({
        success: true,
        message: `Indexed ${blocksToIndex.length} blocks`,
      });
    } else if (action === 'metrics') {
      // Recalculate metrics
      console.log('Starting scheduled metrics recalculation...');
      const metricsService = getMetricsService();
      await metricsService.recalculateAllMetrics();
      console.log('Metrics recalculation completed');

      return NextResponse.json({
        success: true,
        message: 'Metrics recalculated',
      });
    } else if (action === 'network-stats') {
      // Update network stats
      const metricsService = getMetricsService();
      await metricsService.updateNetworkStats();

      return NextResponse.json({
        success: true,
        message: 'Network stats updated',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in cron job:', error);
    await prisma.indexerState.updateMany({
      data: { isRunning: false, errorMessage: error.message },
    });
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

