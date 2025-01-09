-- Kustutame tabelid, kui need eksisteerivad
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- Loome users tabeli
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    age INTEGER,
    spoken_languages TEXT[],  -- PostgreSQL array tüüp
    location VARCHAR(255),
    rate_per_minute DECIMAL(10,2) DEFAULT 0.00,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lisame näidisandmed
INSERT INTO users (username, email, name, password, gender, age, spoken_languages, location, rate_per_minute, role, is_active, email_verified) VALUES
    ('drsmith', 'doctor1@example.com', 'Dr. John Smith', '$2b$10$abcdefghijklmnopqrstuv', 'male', 35, ARRAY['English', 'Spanish'], 'New York, USA', 2.50, 'DOCTOR', true, false),
    ('drjohnson', 'doctor2@example.com', 'Dr. Sarah Johnson', '$2b$10$abcdefghijklmnopqrstuv', 'female', 42, ARRAY['English', 'French'], 'London, UK', 3.00, 'DOCTOR', true, false),
    ('patient1', 'patient1@example.com', 'Bob Wilson', '$2b$10$abcdefghijklmnopqrstuv', 'male', 28, ARRAY['English'], 'Los Angeles, USA', 0.00, 'USER', true, false),
    ('patient2', 'patient2@example.com', 'Alice Brown', '$2b$10$abcdefghijklmnopqrstuv', 'female', 35, ARRAY['English', 'Spanish'], 'Miami, USA', 0.00, 'USER', true, false),
    ('admin', 'admin@example.com', 'Admin User', '$2b$10$abcdefghijklmnopqrstuv', 'other', 30, ARRAY['English'], 'System', 0.00, 'ADMIN', true, false);

-- Loome sessions tabeli
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
