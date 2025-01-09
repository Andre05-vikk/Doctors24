-- Kustutame tabelid, kui need eksisteerivad
DROP TABLE IF EXISTS Session;
DROP TABLE IF EXISTS User;

-- Loome User tabeli
CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    age INT NOT NULL,
    spokenLanguages TEXT NOT NULL,
    location VARCHAR(255),
    ratePerMinute DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role VARCHAR(10) DEFAULT 'USER',
    isActive BOOLEAN DEFAULT TRUE,
    emailVerified BOOLEAN DEFAULT FALSE,
    verificationToken VARCHAR(255),
    tokenExpiry TIMESTAMP NULL,
    resetToken VARCHAR(255),
    resetTokenExpiry TIMESTAMP NULL
);

-- Loome Session tabeli
CREATE TABLE Session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sid VARCHAR(255) UNIQUE NOT NULL,
    data TEXT NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Lisame näidisandmed User tabelisse
INSERT INTO User (username, email, name, password, gender, age, spokenLanguages, location, ratePerMinute, role) 
VALUES 
    ('drsmith', 'doctor1@example.com', 'Dr. John Smith', '$2b$10$abcdefghijklmnopqrstuv', 'male', 35, 'English,Spanish', 'New York, USA', 2.50, 'DOCTOR'),
    ('drjohnson', 'doctor2@example.com', 'Dr. Sarah Johnson', '$2b$10$abcdefghijklmnopqrstuv', 'female', 42, 'English,French', 'London, UK', 3.00, 'DOCTOR'),
    ('patient1', 'patient1@example.com', 'Bob Wilson', '$2b$10$abcdefghijklmnopqrstuv', 'male', 28, 'English', 'Los Angeles, USA', 0.00, 'USER'),
    ('patient2', 'patient2@example.com', 'Alice Brown', '$2b$10$abcdefghijklmnopqrstuv', 'female', 35, 'English,Spanish', 'Miami, USA', 0.00, 'USER'),
    ('admin', 'admin@example.com', 'Admin User', '$2b$10$abcdefghijklmnopqrstuv', 'other', 30, 'English', 'System', 0.00, 'ADMIN'); 