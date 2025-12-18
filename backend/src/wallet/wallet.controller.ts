import { Controller, Get, Param, ParseUUIDPipe, HttpException, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletAddressDto } from './dto/wallet-address.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':address/overview')
  async getWalletOverview(@Param('address') address: string) {
    try {
      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new HttpException('Invalid wallet address format', HttpStatus.BAD_REQUEST);
      }

      const overview = await this.walletService.getWalletOverview(address);
      return {
        success: true,
        data: overview,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get wallet overview: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':address/transactions')
  async getWalletTransactions(
    @Param('address') address: string,
  ) {
    try {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new HttpException('Invalid wallet address format', HttpStatus.BAD_REQUEST);
      }

      const transactions = await this.walletService.getWalletTransactions(address);
      return {
        success: true,
        data: transactions,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get wallet transactions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}








