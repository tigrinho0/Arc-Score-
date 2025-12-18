import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class RpcService {
  private readonly logger = new Logger(RpcService.name);
  private provider: ethers.JsonRpcProvider;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('ARC_RPC_URL') || 'https://rpc.testnet.arc.network';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.logger.log(`RPC Service initialized with URL: ${rpcUrl}`);
  }

  async getBlockNumber(): Promise<number> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return blockNumber;
    } catch (error) {
      this.logger.error(`Error getting block number: ${error.message}`);
      throw error;
    }
  }

  async getBlock(blockNumber: number): Promise<any> {
    try {
      const block = await this.provider.getBlock(blockNumber, true);
      if (!block) {
        return null;
      }

      return {
        number: block.number,
        hash: block.hash,
        timestamp: block.timestamp,
        transactions: block.transactions || [],
      };
    } catch (error) {
      this.logger.error(`Error getting block ${blockNumber}: ${error.message}`);
      return null;
    }
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return null;
      }

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        transactionIndex: receipt.index,
        from: receipt.from,
        to: receipt.to,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        contractAddress: receipt.contractAddress,
      };
    } catch (error) {
      this.logger.error(`Error getting transaction receipt ${txHash}: ${error.message}`);
      return null;
    }
  }

  async getTransactionsInBlock(blockNumber: number): Promise<any[]> {
    try {
      const block = await this.provider.getBlock(blockNumber, true);
      if (!block || !block.transactions) {
        return [];
      }

      const transactions = [];
      for (const tx of block.transactions) {
        if (typeof tx === 'string') {
          // If it's just a hash, fetch the full transaction
          const fullTx = await this.provider.getTransaction(tx);
          if (fullTx) {
            transactions.push({
              hash: fullTx.hash,
              from: fullTx.from,
              to: fullTx.to,
              value: fullTx.value,
              gasPrice: fullTx.gasPrice,
              gasLimit: fullTx.gasLimit,
            });
          }
        } else if (tx && typeof tx === 'object') {
          // If it's already a transaction object
          const txObj = tx as ethers.TransactionResponse;
          transactions.push({
            hash: txObj.hash,
            from: txObj.from,
            to: txObj.to,
            value: txObj.value,
            gasPrice: txObj.gasPrice,
            gasLimit: txObj.gasLimit,
          });
        }
      }

      return transactions;
    } catch (error) {
      this.logger.error(`Error getting transactions in block ${blockNumber}: ${error.message}`);
      return [];
    }
  }
}
