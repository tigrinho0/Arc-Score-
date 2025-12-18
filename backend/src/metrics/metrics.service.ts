import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private prisma: PrismaService) {}

  async getWalletOverview(walletAddress: string) {
    const address = walletAddress.toLowerCase();

    // Get or create wallet
    let wallet = await this.prisma.wallet.findUnique({
      where: { address },
      include: {
        transactions: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
        dailyActivities: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await this.prisma.wallet.create({
        data: {
          address,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
        },
        include: {
          transactions: true,
          dailyActivities: true,
        },
      });
    }

    // Calculate metrics if not already calculated
    if (wallet.arcScore === 0 || !wallet.rank) {
      await this.calculateWalletMetrics(address);
      wallet = await this.prisma.wallet.findUnique({
        where: { address },
        include: {
          transactions: {
            orderBy: { timestamp: 'desc' },
            take: 10,
          },
          dailyActivities: {
            orderBy: { date: 'desc' },
            take: 30,
          },
        },
      });
    }

    const transactionCount = await this.prisma.transaction.count({
      where: { from: address },
    });

    const activeDays = await this.prisma.dailyActivity.count({
      where: { walletAddress: address },
    });

    return {
      address: wallet.address,
      arcScore: wallet.arcScore || 0,
      rank: wallet.rank || null,
      percentile: wallet.percentile || null,
      totalTransactions: transactionCount,
      activeDays: activeDays,
      firstSeenAt: wallet.firstSeenAt,
      lastSeenAt: wallet.lastSeenAt,
      status: wallet.status || 'active',
      recentTransactions: wallet.transactions.slice(0, 10),
      activityData: wallet.dailyActivities,
    };
  }

  async calculateWalletMetrics(walletAddress: string) {
    const address = walletAddress.toLowerCase();

    const transactionCount = await this.prisma.transaction.count({
      where: { from: address },
    });

    const activeDays = await this.prisma.dailyActivity.count({
      where: { walletAddress: address },
    });

    // Simple ARC Score calculation
    // In production, this would be more sophisticated
    const arcScore = Math.min(100, (transactionCount * 0.1) + (activeDays * 2));

    // Update wallet with calculated metrics
    await this.prisma.wallet.update({
      where: { address },
      data: {
        totalTransactions: transactionCount,
        activeDays: activeDays,
        arcScore: arcScore,
      },
    });

    // Recalculate ranks after updating this wallet
    await this.recalculateRanks();
  }

  async recalculateAllMetrics() {
    this.logger.log('Recalculating all wallet metrics...');

    const wallets = await this.prisma.wallet.findMany();

    for (const wallet of wallets) {
      try {
        await this.calculateWalletMetrics(wallet.address);
      } catch (error) {
        this.logger.error(`Error calculating metrics for ${wallet.address}: ${error.message}`);
      }
    }

    await this.updateNetworkStats();
    this.logger.log('All metrics recalculated');
  }

  async recalculateRanks() {
    const wallets = await this.prisma.wallet.findMany({
      orderBy: { arcScore: 'desc' },
    });

    const totalWallets = wallets.length;

    for (let i = 0; i < wallets.length; i++) {
      const wallet = wallets[i];
      const rank = i + 1;
      const percentile = totalWallets > 0 ? ((totalWallets - rank) / totalWallets) * 100 : 0;

      await this.prisma.wallet.update({
        where: { address: wallet.address },
        data: {
          rank,
          percentile,
        },
      });
    }
  }

  async updateNetworkStats() {
    const totalWallets = await this.prisma.wallet.count();
    const totalTransactions = await this.prisma.transaction.count();
    
    const walletsWithTransactions = await this.prisma.wallet.count({
      where: {
        totalTransactions: {
          gt: 0,
        },
      },
    });

    // Calculate average transactions per wallet
    const avgTransactionsPerWallet = totalWallets > 0 
      ? totalTransactions / totalWallets 
      : 0;

    // Get median transactions per wallet
    const wallets = await this.prisma.wallet.findMany({
      where: {
        totalTransactions: {
          gt: 0,
        },
      },
      orderBy: {
        totalTransactions: 'asc',
      },
    });

    let medianTransactionsPerWallet = 0;
    if (wallets.length > 0) {
      const mid = Math.floor(wallets.length / 2);
      medianTransactionsPerWallet = wallets.length % 2 === 0
        ? (wallets[mid - 1].totalTransactions + wallets[mid].totalTransactions) / 2
        : wallets[mid].totalTransactions;
    }

    // Get last processed block from indexer state
    const indexerState = await this.prisma.indexerState.findFirst();
    const lastProcessedBlock = indexerState?.lastBlockNumber || '0';

    await this.prisma.networkStats.upsert({
      where: { id: '1' },
      create: {
        id: '1',
        totalWallets,
        totalTransactions: totalTransactions.toString(),
        totalActiveWallets: walletsWithTransactions,
        avgTransactionsPerWallet,
        medianTransactionsPerWallet,
        lastProcessedBlock,
      },
      update: {
        totalWallets,
        totalTransactions: totalTransactions.toString(),
        totalActiveWallets: walletsWithTransactions,
        avgTransactionsPerWallet,
        medianTransactionsPerWallet,
        lastProcessedBlock,
      },
    });
  }
}
