import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let stats = await prisma.networkStats.findUnique({
      where: { id: '1' },
    });

    // If stats don't exist, create default
    if (!stats) {
      stats = await prisma.networkStats.create({
        data: {
          id: '1',
          totalWallets: 0,
          totalTransactions: '0',
          totalActiveWallets: 0,
          avgTransactionsPerWallet: 0,
          medianTransactionsPerWallet: 0,
          lastProcessedBlock: '0',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalWallets: stats.totalWallets,
        totalTransactions: stats.totalTransactions.toString(),
        totalActiveWallets: stats.totalActiveWallets,
        avgTransactionsPerWallet: stats.avgTransactionsPerWallet,
        medianTransactionsPerWallet: stats.medianTransactionsPerWallet,
        lastProcessedBlock: stats.lastProcessedBlock.toString(),
        lastUpdated: stats.lastUpdated,
      },
    });
  } catch (error: any) {
    console.error('Error getting network stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

