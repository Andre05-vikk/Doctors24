-- 1. Keskmine tasu arstide kohta soo järgi
SELECT 
    gender,
    COUNT(*) as doctors_count,
    AVG(rate_per_minute) as avg_rate
FROM users
WHERE role = 'DOCTOR'
GROUP BY gender;

-- 2. Kasutajate arv keelte ja rollide lõikes
SELECT 
    value as language,
    role,
    COUNT(*) as users_count
FROM users 
CROSS APPLY STRING_SPLIT(spoken_languages, ',')
GROUP BY value, role
HAVING COUNT(*) > 1
ORDER BY users_count DESC;

-- 3. Aktiivsed kasutajad, kes räägivad mitut keelt
SELECT 
    name,
    age,
    spoken_languages,
    LEN(spoken_languages) - LEN(REPLACE(spoken_languages, ',', '')) + 1 as languages_count
FROM users
WHERE is_active = 1 
AND spoken_languages LIKE '%,%'
ORDER BY age DESC;
