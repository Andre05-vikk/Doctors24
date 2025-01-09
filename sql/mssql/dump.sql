-- Kustutame tabelid, kui need eksisteerivad
IF OBJECT_ID('dbo.sessions', 'U') IS NOT NULL DROP TABLE dbo.sessions;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;

-- Loome users tabeli
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    gender NVARCHAR(50),
    age INT,
    spoken_languages NVARCHAR(MAX),
    location NVARCHAR(255),
    rate_per_minute DECIMAL(10,2) DEFAULT 0.00,
    role NVARCHAR(50) NOT NULL,
    is_active BIT DEFAULT 1,
    email_verified BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Lisame näidisandmed
INSERT INTO users (username, email, name, password, gender, age, spoken_languages, location, rate_per_minute, role, is_active, email_verified) VALUES
    ('drsmith', 'doctor1@example.com', 'Dr. John Smith', '$2b$10$abcdefghijklmnopqrstuv', 'male', 35, 'English,Spanish', 'New York, USA', 2.50, 'DOCTOR', 1, 0),
    ('drjohnson', 'doctor2@example.com', 'Dr. Sarah Johnson', '$2b$10$abcdefghijklmnopqrstuv', 'female', 42, 'English,French', 'London, UK', 3.00, 'DOCTOR', 1, 0),
    ('patient1', 'patient1@example.com', 'Bob Wilson', '$2b$10$abcdefghijklmnopqrstuv', 'male', 28, 'English', 'Los Angeles, USA', 0.00, 'USER', 1, 0),
    ('patient2', 'patient2@example.com', 'Alice Brown', '$2b$10$abcdefghijklmnopqrstuv', 'female', 35, 'English,Spanish', 'Miami, USA', 0.00, 'USER', 1, 0),
    ('admin', 'admin@example.com', 'Admin User', '$2b$10$abcdefghijklmnopqrstuv', 'other', 30, 'English', 'System', 0.00, 'ADMIN', 1, 0);

-- Loome sessions tabeli
CREATE TABLE sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id),
    token NVARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
