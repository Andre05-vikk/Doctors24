-- 1. Keskmine tasu arstide kohta soo järgi
SELECT 
    gender,
    COUNT(*) as doctors_count,
    AVG(rate_per_minute) as avg_rate
FROM users 
WHERE role = 'DOCTOR'
GROUP BY gender;

-- 2. Kasutajate arv erinevate keelte ja rollide lõikes
SELECT 
    unnest(spoken_languages) as language,
    role,
    COUNT(*) as users_count
FROM users 
GROUP BY language, role
ORDER BY users_count DESC
LIMIT 5;

-- 3. Aktiivsed kasutajad, kes räägivad mitut keelt
SELECT 
    name,
    spoken_languages
FROM users
WHERE is_active = true 
AND array_length(spoken_languages, 1) > 1
ORDER BY array_length(spoken_languages, 1) DESC;
