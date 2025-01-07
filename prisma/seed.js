const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

async function main() {
    // Create test users
    const testUsers = [
        {
            username: 'drsmith',
            email: 'docomctor1@example.com',
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
            username: 'drjohnson',
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
            username: 'admin',
            email: 'admin@example.com',
            password: await bcrypt.hash('Admin123!@#', 10),
            name: 'Admin User',
            gender: 'other',
            age: 30,
            spokenLanguages: 'English',
            location: 'System',
            ratePerMinute: 0,
            role: 'ADMIN'
        },
        {
            username: 'test123',
            email: 'test@test.com',
            password: await bcrypt.hash('Test123!@#', 10),
            name: 'Test User',
            gender: 'male',
            age: 35,
            spokenLanguages: 'English,Spanish',
            location: 'New York, USA',
            ratePerMinute: 2.50,
            role: 'DOCTOR'
        }
    ];

    for (const userData of testUsers) {
        // Upsert instead of create - updates if exists, creates if not
        await prisma.user.upsert({
            where: { email: userData.email },
            update: userData,
            create: userData
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