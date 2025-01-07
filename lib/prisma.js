const { PrismaClient } = require('@prisma/client');

// Declare global variable for prisma instance
let prismaInstance = null;

class PrismaHandler {
    constructor() {
        if (!prismaInstance) {
            prismaInstance = new PrismaClient();
        }
        return prismaInstance;
    }
}

// Export single instance
module.exports = new PrismaHandler(); 