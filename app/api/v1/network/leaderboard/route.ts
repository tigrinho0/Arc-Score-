import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const wallets = await prisma.wallet.findMany({
      where: {
        totalTransactions: {
          gt: 0,
        },
      },
      orderBy: {
        arcScore: 'desc',
      },
      take: limit,
      skip: offset,
      select: {
        address: true,
        arcScore: true,
        rank: true,
        percentile: true,
        totalTransactions: true,
        activeDays: true,
        status: true,
      },
    });

    const total = await prisma.wallet.count({
      where: {
        totalTransactions: {
          gt: 0,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: wallets.map((wallet) => ({
          rank: wallet.rank,
          wallet: wallet.address,
          score: wallet.arcScore,
          percentile: wallet.percentile,
          totalTransactions: wallet.totalTransactions,
          activeDays: wallet.activeDays,
          status: wallet.status,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting leaderboard:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

