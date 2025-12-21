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

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      this.logger.error(`Error getting balance for ${address}: ${error.message}`);
      return '0';
    }
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
      this.logger.log(`Fetching token balance - Token: ${tokenAddress}, Wallet: ${walletAddress}`);
      
      // ERC-20 ABI minimal - only balanceOf function
      const erc20Abi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];

      // Try with original addresses first, then checksummed
      let contract;
      try {
        // First try with checksummed token address
        const checksummedTokenAddress = ethers.getAddress(tokenAddress);
        this.logger.log(`Using checksummed token address: ${checksummedTokenAddress}`);
        contract = new ethers.Contract(checksummedTokenAddress, erc20Abi, this.provider);
      } catch (checksumError) {
        // If checksumming fails, use address as-is
        this.logger.warn(`Checksum failed, using token address as-is: ${checksumError.message}`);
        contract = new ethers.Contract(tokenAddress, erc20Abi, this.provider);
      }

      // Get balance - try with checksummed wallet address first
      let balance;
      try {
        const checksummedWalletAddress = ethers.getAddress(walletAddress);
        balance = await contract.balanceOf(checksummedWalletAddress);
      } catch {
        // Fallback to original address
        balance = await contract.balanceOf(walletAddress);
      }
      
      const balanceString = balance.toString();
      this.logger.log(`✅ Token balance retrieved: ${balanceString}`);
      return balanceString;
    } catch (error: any) {
      this.logger.error(`❌ Error getting token balance for ${walletAddress} on ${tokenAddress}: ${error.message}`);
      if (error.code) {
        this.logger.error(`Error code: ${error.code}`);
      }
      if (error.data) {
        this.logger.error(`Error data: ${error.data}`);
      }
      if (error.reason) {
        this.logger.error(`Error reason: ${error.reason}`);
      }
      // Return '0' instead of throwing to prevent breaking the API
      return '0';
    }
  }

  async getTokenDecimals(tokenAddress: string): Promise<number> {
    try {
      const erc20Abi = ['function decimals() view returns (uint8)'];
      const contract = new ethers.Contract(tokenAddress, erc20Abi, this.provider);
      const decimals = await contract.decimals();
      return decimals;
    } catch (error) {
      this.logger.warn(`Error getting decimals for token ${tokenAddress}, defaulting to 6 (USDC): ${error.message}`);
      return 6; // USDC default decimals
    }
  }
}
