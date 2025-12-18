import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create initial network stats
  await prisma.networkStats.upsert({
    where: { id: '1' },
    create: {
      id: '1',
      totalWallets: 0,
      totalTransactions: '0',
      totalActiveWallets: 0,
      avgTransactionsPerWallet: 0,
      medianTransactionsPerWallet: 0,
      lastProcessedBlock: '0',
    },
    update: {},
  });

  // Create initial indexer state
  await prisma.indexerState.upsert({
    where: { id: '1' },
    create: {
      id: '1',
      lastBlockNumber: '0',
      isRunning: false,
    },
    update: {},
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

