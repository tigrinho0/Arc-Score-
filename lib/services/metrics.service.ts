import { prisma } from '../prisma';
import { getRpcService } from './rpc.service';

export class MetricsService {
  private rpcService = getRpcService();

  async getWalletOverview(walletAddress: string) {
    const address = walletAddress.toLowerCase();
    let wallet = await prisma.wallet.findUnique({
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
      wallet = await prisma.wallet.create({
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

    if (wallet.arcScore === 0 || !wallet.rank) {
      await this.calculateWalletMetrics(address);
      wallet = await prisma.wallet.findUnique({
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

    const transactionCount = await prisma.transaction.count({
      where: { from: address },
    });

    const activeDays = await prisma.dailyActivity.count({
      where: { walletAddress: address },
    });

    let nativeBalance = '0';
    try {
      nativeBalance = await this.rpcService.getBalance(walletAddress);
      console.log(`Native balance for ${walletAddress}: ${nativeBalance}`);
    } catch (error: any) {
      console.warn(`Failed to get native balance for ${walletAddress}: ${error.message}`);
    }

    let usdcBalance = '0';
    const usdcContractAddress = process.env.USDC_CONTRACT_ADDRESS;
    console.log(`Checking USDC balance - Contract: ${usdcContractAddress}, Wallet: ${walletAddress}`);
    if (usdcContractAddress && usdcContractAddress !== '0x0000000000000000000000000000000000000000') {
      try {
        usdcBalance = await this.rpcService.getTokenBalance(usdcContractAddress, walletAddress);
        console.log(`✅ USDC balance for ${walletAddress}: ${usdcBalance} (raw)`);
        const usdcAmount = Number(usdcBalance) / 1e6;
        console.log(`✅ USDC balance formatted: ${usdcAmount.toFixed(2)} USDC`);
      } catch (error: any) {
        console.error(`❌ Failed to get USDC balance for ${walletAddress}: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
    } else {
      console.warn(`⚠️ USDC_CONTRACT_ADDRESS not configured or invalid: ${usdcContractAddress}`);
    }

    return {
      address: wallet!.address,
      arcScore: wallet!.arcScore || 0,
      rank: wallet!.rank || null,
      percentile: wallet!.percentile || null,
      totalTransactions: transactionCount,
      activeDays: activeDays,
      firstSeenAt: wallet!.firstSeenAt,
      lastSeenAt: wallet!.lastSeenAt,
      status: wallet!.status || 'active',
      recentTransactions: wallet!.transactions.slice(0, 10),
      activityData: wallet!.dailyActivities,
      balance: {
        native: nativeBalance,
        usdc: usdcBalance,
      },
    };
  }

  async calculateWalletMetrics(walletAddress: string) {
    const address = walletAddress.toLowerCase();
    const transactionCount = await prisma.transaction.count({
      where: { from: address },
    });

    const activeDays = await prisma.dailyActivity.count({
      where: { walletAddress: address },
    });

    const arcScore = Math.min(100, transactionCount * 0.1 + activeDays * 2);

    await prisma.wallet.update({
      where: { address },
      data: {
        totalTransactions: transactionCount,
        activeDays: activeDays,
        arcScore: arcScore,
      },
    });

    await this.recalculateRanks();
  }

  async recalculateAllMetrics() {
    console.log('Recalculating all wallet metrics...');
    const wallets = await prisma.wallet.findMany();
    for (const wallet of wallets) {
      try {
        await this.calculateWalletMetrics(wallet.address);
      } catch (error: any) {
        console.error(`Error calculating metrics for ${wallet.address}: ${error.message}`);
      }
    }
    await this.updateNetworkStats();
    console.log('All metrics recalculated');
  }

  async recalculateRanks() {
    const wallets = await prisma.wallet.findMany({
      orderBy: { arcScore: 'desc' },
    });

    const totalWallets = wallets.length;

    for (let i = 0; i < wallets.length; i++) {
      const wallet = wallets[i];
      const rank = i + 1;
      const percentile = totalWallets > 0 ? ((totalWallets - rank) / totalWallets) * 100 : 0;

      await prisma.wallet.update({
        where: { address: wallet.address },
        data: {
          rank,
          percentile,
        },
      });
    }
  }

  async updateNetworkStats() {
    const totalWallets = await prisma.wallet.count();
    const totalTransactions = await prisma.transaction.count();
    const walletsWithTransactions = await prisma.wallet.count({
      where: {
        totalTransactions: {
          gt: 0,
        },
      },
    });

    const avgTransactionsPerWallet = totalWallets > 0 ? totalTransactions / totalWallets : 0;

    const wallets = await prisma.wallet.findMany({
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
      medianTransactionsPerWallet =
        wallets.length % 2 === 0
          ? (wallets[mid - 1].totalTransactions + wallets[mid].totalTransactions) / 2
          : wallets[mid].totalTransactions;
    }

    const indexerState = await prisma.indexerState.findFirst();
    const lastProcessedBlock = indexerState?.lastBlockNumber || '0';

    await prisma.networkStats.upsert({
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

// Singleton instance
let metricsServiceInstance: MetricsService | null = null;

export function getMetricsService(): MetricsService {
  if (!metricsServiceInstance) {
    metricsServiceInstance = new MetricsService();
  }
  return metricsServiceInstance;
}

