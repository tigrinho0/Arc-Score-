import { NextRequest, NextResponse } from 'next/server';
import { getMetricsService } from '@/lib/services/metrics.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const metricsService = getMetricsService();
    const overview = await metricsService.getWalletOverview(address);

    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error: any) {
    console.error('Error getting wallet overview:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to get wallet overview: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

