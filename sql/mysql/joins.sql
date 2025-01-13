-- JOIN päring arstide ja nende spetsialiseerumise kohta
SELECT 
    u.name AS "Arsti nimi",
    u.email AS "Email",
    d.specialization AS "Spetsialiseerumine",
    d.experience AS "Kogemus",
    u.ratePerMinute AS "Hind minutis",
    u.location AS "Asukoht"
FROM 
    User u
LEFT JOIN 
    Doctor d ON u.id = d.userId
WHERE 
    u.role = 'DOCTOR'
    AND u.isActive = true
ORDER BY 
    u.ratePerMinute ASC;

/* 
Päringu selgitus:
1. LEFT JOIN tagab, et näeme kõiki arste, isegi kui neil pole veel Doctor tabelis kirjet
2. WHERE filtreerib välja ainult arstid ja aktiivsed kasutajad
3. ORDER BY sorteerib tulemused hinna järgi, odavamad eespool

Oodatav väljund:
Arsti nimi | Email | Spetsialiseerumine | Kogemus | Hind minutis | Asukoht
Dr. Smith | smith@example.com | Kardioloogia | 10 aastat | 2.50 | Tallinn
Dr. Jones | jones@example.com | NULL | NULL | 3.00 | Tartu
*/ 