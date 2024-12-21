const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.user.deleteMany();

    // Create test users
    const testUsers = [
        {
            email: 'doctor1@example.com',
            password: await bcrypt.hash('Test123!@#', 10),
            name: 'Dr. John Smith',
            gender: 'male',
            age: 35,
            spokenLanguages: 'English,Spanish',
            location: 'New York, USA',
            ratePerMinute: 2.50,
            role: 'USER'
        },
        {
            email: 'doctor2@example.com',
            password: await bcrypt.hash('Test123!@#', 10),
            name: 'Dr. Sarah Johnson',
            gender: 'female',
            age: 42,
            spokenLanguages: 'English,French',
            location: 'London, UK',
            ratePerMinute: 3.00,
            role: 'USER'
        },
        {
            email: 'admin@example.com',
            password: await bcrypt.hash('Admin123!@#', 10),
            name: 'Admin User',
            gender: 'other',
            age: 30,
            spokenLanguages: 'English',
            location: 'System',
            ratePerMinute: 0,
            role: 'ADMIN'
        }
    ];

    for (const userData of testUsers) {
        await prisma.user.create({
            data: userData
        });
    }

    console.log('Seed data inserted successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });