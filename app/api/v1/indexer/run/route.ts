import { NextRequest, NextResponse } from 'next/server';
import { getIndexerService } from '@/lib/services/indexer.service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if indexer is enabled
    if (process.env.INDEXER_ENABLED !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Indexer is not enabled' },
        { status: 403 }
      );
    }

    // Check if already running
    const state = await prisma.indexerState.findFirst();
    if (state?.isRunning) {
      return NextResponse.json(
        { success: false, error: 'Indexer already running' },
        { status: 409 }
      );
    }

    // Mark as running
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
        blocksIndexed: 0,
      });
    }

    console.log(
      `Indexing ${blocksToIndex.length} blocks (${blocksToIndex[0]} to ${blocksToIndex[blocksToIndex.length - 1]})`
    );

    let successCount = 0;
    let errorCount = 0;

    for (const blockNumber of blocksToIndex) {
      try {
        await indexerService.indexBlock(blockNumber);
        successCount++;
      } catch (error: any) {
        console.error(`Error indexing block ${blockNumber}: ${error.message}`);
        errorCount++;
        // Continue with next block
      }
    }

    // Mark as not running
    await prisma.indexerState.updateMany({
      data: { isRunning: false },
    });

    return NextResponse.json({
      success: true,
      message: `Indexed ${successCount} blocks successfully`,
      blocksIndexed: successCount,
      errors: errorCount,
    });
  } catch (error: any) {
    console.error('Error in indexer:', error);
    await prisma.indexerState.updateMany({
      data: { isRunning: false, errorMessage: error.message },
    });
    return NextResponse.json(
      {
        success: false,
        error: `Error in indexer: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

