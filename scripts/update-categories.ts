// Script to check categories
// Run this with: npx tsx scripts/check-categories.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Show all categories
    const allPosts = await prisma.post.findMany({
        select: {
            category: true,
            published: true,
        }
    });

    const categories = [...new Set(allPosts.map(p => p.category))];

    console.log('\n📊 Category Statistics:\n');
    console.log(`Total posts: ${allPosts.length}`);
    console.log(`Published posts: ${allPosts.filter(p => p.published).length}`);
    console.log(`Total categories: ${categories.length}\n`);

    console.log('Categories breakdown:');
    categories.forEach(cat => {
        const total = allPosts.filter(p => p.category === cat).length;
        const published = allPosts.filter(p => p.category === cat && p.published).length;
        console.log(`  📁 ${cat}: ${published}/${total} posts (published/total)`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
