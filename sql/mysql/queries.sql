-- 1. Keskmine tasu arstide kohta soo järgi
SELECT gender, 
       COUNT(*) as doctors_count,
       AVG(ratePerMinute) as avg_rate
FROM User 
WHERE role = 'DOCTOR'
GROUP BY gender;

-- 2. Kasutajate arv erinevate keelte ja rollide lõikes
SELECT role, 
       spokenLanguages,
       COUNT(*) as users_count
FROM User
GROUP BY role, spokenLanguages
ORDER BY users_count DESC
LIMIT 5;

-- 3. Aktiivsed kasutajad, kes räägivad mitut keelt
SELECT name, 
       spokenLanguages,
       (LENGTH(spokenLanguages) - LENGTH(REPLACE(spokenLanguages, ',', '')) + 1) as languages_count
FROM User
WHERE isActive = TRUE
  AND spokenLanguages LIKE '%,%'
ORDER BY languages_count DESC; 