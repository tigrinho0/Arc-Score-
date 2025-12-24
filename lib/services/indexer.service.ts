import { prisma } from '../prisma';
import { getRpcService } from './rpc.service';

export class IndexerService {
  private rpcService = getRpcService();
  private readonly batchSize: number;

  constructor() {
    this.batchSize = parseInt(process.env.INDEXER_BATCH_SIZE || '100');
  }

  async indexBlock(blockNumber: number): Promise<void> {
    try {
      console.log(`Indexing block ${blockNumber}`);

      const block = await this.rpcService.getBlock(blockNumber);
      if (!block) {
        console.warn(`Block ${blockNumber} not found`);
        return;
      }

      if (!block.transactions || block.transactions.length === 0) {
        await this.updateIndexerState(blockNumber, block.hash || null);
        return;
      }

      // Process transactions in batches
      const transactions = await this.rpcService.getTransactionsInBlock(blockNumber);

      for (const tx of transactions) {
        if (!tx.from) continue;

        await this.processTransaction(tx, block);
      }

      await this.updateIndexerState(blockNumber, block.hash || null);
      console.log(`Successfully indexed block ${blockNumber} with ${transactions.length} transactions`);
    } catch (error: any) {
      console.error(`Error indexing block ${blockNumber}: ${error.message}`);
      throw error;
    }
  }

  private async processTransaction(tx: any, block: any): Promise<void> {
    try {
      const receipt = await this.rpcService.getTransactionReceipt(tx.hash);
      if (!receipt) {
        return;
      }

      // Check if transaction already exists
      const existing = await prisma.transaction.findUnique({
        where: { hash: tx.hash },
      });

      if (existing) {
        return;
      }

      // Get or create wallet
      await prisma.wallet.upsert({
        where: { address: tx.from.toLowerCase() },
        create: {
          address: tx.from.toLowerCase(),
          firstSeenAt: new Date(block.timestamp * 1000),
          lastSeenAt: new Date(block.timestamp * 1000),
        },
        update: {
          lastSeenAt: new Date(block.timestamp * 1000),
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          hash: tx.hash,
          blockNumber: block.number.toString(),
          blockHash: block.hash,
          from: tx.from.toLowerCase(),
          to: tx.to ? tx.to.toLowerCase() : null,
          value: tx.value ? tx.value.toString() : '0',
          gasUsed: (receipt.gasUsed || BigInt(0)).toString(),
          gasPrice: tx.gasPrice ? tx.gasPrice.toString() : '0',
          timestamp: new Date(block.timestamp * 1000),
          transactionIndex: receipt.index,
          status: receipt.status || 1,
          isContractCreation: receipt.contractAddress !== null,
          contractAddress: receipt.contractAddress || null,
        },
      });

      // Update daily activity
      const txDate = new Date(block.timestamp * 1000);
      txDate.setHours(0, 0, 0, 0);

      await prisma.dailyActivity.upsert({
        where: {
          walletAddress_date: {
            walletAddress: tx.from.toLowerCase(),
            date: txDate,
          },
        },
        create: {
          walletAddress: tx.from.toLowerCase(),
          date: txDate,
          transactionCount: 1,
        },
        update: {
          transactionCount: {
            increment: 1,
          },
        },
      });

      console.log(`Processed transaction ${tx.hash}`);
    } catch (error: any) {
      console.error(`Error processing transaction ${tx.hash}: ${error.message}`);
      // Continue processing other transactions
    }
  }

  async indexWalletTransactions(walletAddress: string): Promise<number> {
    try {
      console.log(`Indexing transactions for wallet ${walletAddress}`);

      const wallet = await prisma.wallet.findUnique({
        where: { address: walletAddress.toLowerCase() },
      });

      if (!wallet) {
        console.warn(`Wallet ${walletAddress} not found in database`);
        return 0;
      }

      const count = await prisma.transaction.count({
        where: { from: walletAddress.toLowerCase() },
      });

      return count;
    } catch (error: any) {
      console.error(`Error indexing wallet transactions: ${error.message}`);
      throw error;
    }
  }

  async getIndexerState() {
    let state = await prisma.indexerState.findFirst();

    if (!state) {
      const startBlock = parseInt(process.env.INDEXER_START_BLOCK || '0');
      state = await prisma.indexerState.create({
        data: {
          id: '1',
          lastBlockNumber: startBlock.toString(),
        },
      });
    }

    return state;
  }

  private async updateIndexerState(blockNumber: number, blockHash: string | null): Promise<void> {
    await prisma.indexerState.upsert({
      where: { id: '1' },
      create: {
        id: '1',
        lastBlockNumber: blockNumber.toString(),
        lastBlockHash: blockHash,
        lastRunAt: new Date(),
        isRunning: false,
      },
      update: {
        lastBlockNumber: blockNumber.toString(),
        lastBlockHash: blockHash,
        lastRunAt: new Date(),
        isRunning: false,
      },
    });
  }

  async getLatestBlockNumber(): Promise<number> {
    return await this.rpcService.getBlockNumber();
  }

  async getBlocksToIndex(): Promise<number[]> {
    const state = await this.getIndexerState();
    const currentBlock = await this.getLatestBlockNumber();
    const lastIndexed = parseInt(state.lastBlockNumber || '0');

    if (currentBlock <= lastIndexed) {
      return [];
    }

    const blocksToIndex: number[] = [];
    const endBlock = Math.min(lastIndexed + this.batchSize, currentBlock);

    for (let i = lastIndexed + 1; i <= endBlock; i++) {
      blocksToIndex.push(i);
    }

    return blocksToIndex;
  }
}

// Singleton instance
let indexerServiceInstance: IndexerService | null = null;

export function getIndexerService(): IndexerService {
  if (!indexerServiceInstance) {
    indexerServiceInstance = new IndexerService();
  }
  return indexerServiceInstance;
}

