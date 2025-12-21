import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { NetworkService } from './network.service';

@Controller('network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get('stats')
  async getNetworkStats() {
    try {
      const stats = await this.networkService.getNetworkStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    try {
      const leaderboard = await this.networkService.getLeaderboard(limit, offset);
      return {
        success: true,
        data: leaderboard,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}











