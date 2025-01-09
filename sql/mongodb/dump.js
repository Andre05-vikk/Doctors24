// Kustutame olemasolevad kollektsioonid
db.users.drop();
db.sessions.drop();

// Loome users kollektsiooni
db.createCollection("users");

// Lisame näidisandmed
db.users.insertMany([
    {
        username: "drsmith",
        email: "doctor1@example.com",
        name: "Dr. John Smith",
        password: "$2b$10$abcdefghijklmnopqrstuv",
        gender: "male",
        age: 35,
        spokenLanguages: ["English", "Spanish"],
        location: "New York, USA",
        ratePerMinute: 2.50,
        role: "DOCTOR",
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        username: "drjohnson",
        email: "doctor2@example.com",
        name: "Dr. Sarah Johnson",
        password: "$2b$10$abcdefghijklmnopqrstuv",
        gender: "female",
        age: 42,
        spokenLanguages: ["English", "French"],
        location: "London, UK",
        ratePerMinute: 3.00,
        role: "DOCTOR",
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        username: "patient1",
        email: "patient1@example.com",
        name: "Bob Wilson",
        password: "$2b$10$abcdefghijklmnopqrstuv",
        gender: "male",
        age: 28,
        spokenLanguages: ["English"],
        location: "Los Angeles, USA",
        ratePerMinute: 0.00,
        role: "USER",
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        username: "patient2",
        email: "patient2@example.com",
        name: "Alice Brown",
        password: "$2b$10$abcdefghijklmnopqrstuv",
        gender: "female",
        age: 35,
        spokenLanguages: ["English", "Spanish"],
        location: "Miami, USA",
        ratePerMinute: 0.00,
        role: "USER",
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        username: "admin",
        email: "admin@example.com",
        name: "Admin User",
        password: "$2b$10$abcdefghijklmnopqrstuv",
        gender: "other",
        age: 30,
        spokenLanguages: ["English"],
        location: "System",
        ratePerMinute: 0.00,
        role: "ADMIN",
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]); 