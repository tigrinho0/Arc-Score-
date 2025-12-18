import { Injectable } from '@nestjs/common';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(
    private metricsService: MetricsService,
    private prisma: PrismaService,
  ) {}

  async getWalletOverview(walletAddress: string) {
    return await this.metricsService.getWalletOverview(walletAddress);
  }

  async getWalletTransactions(walletAddress: string, limit = 100, offset = 0) {
    const address = walletAddress.toLowerCase();

    const transactions = await this.prisma.transaction.findMany({
      where: { from: address },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      select: {
        hash: true,
        blockNumber: true,
        from: true,
        to: true,
        value: true,
        gasUsed: true,
        gasPrice: true,
        timestamp: true,
        status: true,
        isContractCreation: true,
        contractAddress: true,
      },
    });

    const total = await this.prisma.transaction.count({
      where: { from: address },
    });

    return {
      transactions: transactions.map((tx) => ({
        ...tx,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed,
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

