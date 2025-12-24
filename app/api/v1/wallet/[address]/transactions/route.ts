import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const lowerAddress = address.toLowerCase();

    const transactions = await prisma.transaction.findMany({
      where: { from: lowerAddress },
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

    const total = await prisma.transaction.count({
      where: { from: lowerAddress },
    });

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error: any) {
    console.error('Error getting wallet transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to get wallet transactions: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

