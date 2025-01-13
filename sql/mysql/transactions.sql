-- Loome Doctor tabeli
CREATE TABLE IF NOT EXISTS Doctor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    specialization VARCHAR(255) NOT NULL,
    experience VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Edukas stsenaarium
START TRANSACTION;

-- Esimene operatsioon
INSERT INTO User (username, email, name, password, gender, age, spokenLanguages, location, ratePerMinute, role, createdAt, updatedAt)
VALUES ('test_user', 'test@example.com', 'Test User', '$2b$10$testHash', 'male', 30, 'English', 'Tallinn', 0.00, 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Teine operatsioon
UPDATE User SET role = 'DOCTOR', ratePerMinute = 2.50 
WHERE email = 'test@example.com';

COMMIT;

-- Ebaõnnestunud stsenaarium
START TRANSACTION;

-- Esimene operatsioon
INSERT INTO User (username, email, name, password, gender, age, spokenLanguages, location, ratePerMinute, role, createdAt, updatedAt)
VALUES ('fail_user', 'fail@example.com', 'Fail User', '$2b$10$testHash', 'male', 30, 'English', 'Tallinn', 0.00, 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Teine operatsioon (peaks ebaõnnestuma)
UPDATE User SET nonexistent_column = 'value' 
WHERE email = 'fail@example.com';

ROLLBACK;

/*
TRANSAKTSIOONI TESTIMISE TULEMUSED:

1. Edukas stsenaarium:
   - Esimene operatsioon: Uue kasutaja 'test_user' lisamine õnnestus
   - Teine operatsioon: Kasutaja rolli muutmine USER -> DOCTOR õnnestus
   - COMMIT: Muudatused salvestati andmebaasi

2. Ebaõnnestunud stsenaarium:
   - Esimene operatsioon: Uue kasutaja 'fail_user' lisamine õnnestus
   - Teine operatsioon: Ebaõnnestus veaga "Unknown column 'nonexistent_column'"
   - ROLLBACK: Kõik muudatused tühistati automaatselt

3. Kontroll:
   - test_user on andmebaasis DOCTOR rolliga
   - fail_user puudub andmebaasist (ROLLBACK töötas)

See näitab, et:
- Transaktsioonid töötavad korrektselt
- ROLLBACK mehanism tagab andmete terviklikkuse
- Muudatused kas rakenduvad täielikult või tühistatakse täielikult
*/ 