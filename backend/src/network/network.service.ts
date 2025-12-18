import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NetworkService {
  constructor(private prisma: PrismaService) {}

  async getNetworkStats() {
    let stats = await this.prisma.networkStats.findUnique({
      where: { id: '1' },
    });

    // If stats don't exist, create default
    if (!stats) {
      stats = await this.prisma.networkStats.create({
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

    return {
      totalWallets: stats.totalWallets,
      totalTransactions: stats.totalTransactions.toString(),
      totalActiveWallets: stats.totalActiveWallets,
      avgTransactionsPerWallet: stats.avgTransactionsPerWallet,
      medianTransactionsPerWallet: stats.medianTransactionsPerWallet,
      lastProcessedBlock: stats.lastProcessedBlock.toString(),
      lastUpdated: stats.lastUpdated,
    };
  }

  async getLeaderboard(limit: number = 100, offset: number = 0) {
    const wallets = await this.prisma.wallet.findMany({
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

    const total = await this.prisma.wallet.count({
      where: {
        totalTransactions: {
          gt: 0,
        },
      },
    });

    return {
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
    };
  }
}

