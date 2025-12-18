import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsScheduler {
  private readonly logger = new Logger(MetricsScheduler.name);

  constructor(private metricsService: MetricsService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleMetricsRecalculation() {
    try {
      this.logger.log('Starting scheduled metrics recalculation...');
      await this.metricsService.recalculateAllMetrics();
      this.logger.log('Metrics recalculation completed');
    } catch (error) {
      this.logger.error(`Error in metrics recalculation: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleNetworkStatsUpdate() {
    try {
      await this.metricsService.updateNetworkStats();
    } catch (error) {
      this.logger.error(`Error updating network stats: ${error.message}`);
    }
  }
}








