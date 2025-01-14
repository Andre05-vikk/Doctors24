-- Anname õigused AINULT doctors24 andmebaasile
GRANT SELECT, INSERT, UPDATE, DELETE ON doctors24.* TO 'doctors24_user'@'%';

-- Rakendame muudatused
FLUSH PRIVILEGES;

/* 
Selgitus:
GRANT annab kasutajale õigused:
- SELECT, INSERT, UPDATE, DELETE operatsioonideks
- Ainult doctors24 andmebaasis (doctors24.*)
- Ei anna ligipääsu teistele andmebaasidele

Oodatav tulemus SHOW GRANTS käsuga:
GRANT USAGE ON *.* TO 'doctors24_user'@'%'
GRANT SELECT, INSERT, UPDATE, DELETE ON `doctors24`.* TO 'doctors24_user'@'%'

Tehtu näitab:

1. Kasutaja õiguste korrektset piiramist:
   - GRANT USAGE ON *.* näitab baasligipääsu süsteemile
   - GRANT SELECT, INSERT, UPDATE, DELETE ON doctors24.* näitab, et:
     - Ligipääs on ainult doctors24 andmebaasile
     - Lubatud on ainult andmete lugemine (SELECT)
     - Lubatud on andmete lisamine (INSERT)
     - Lubatud on andmete muutmine (UPDATE)
     - Lubatud on andmete kustutamine (DELETE)

2. Turvalisuse tagamist:
   - Puuduvad õigused teistele andmebaasidele
   - Puuduvad ohtlikud õigused nagu CREATE, DROP, ALTER
   - Kasutaja ei saa muuta andmebaasi struktuuri

3. Rakenduse funktsionaalsuse säilitamist:
   - Kõik vajalikud õigused andmetega töötamiseks on olemas
   - Kasutaja saab teha kõiki tavapäraseid andmeoperatsioone
*/