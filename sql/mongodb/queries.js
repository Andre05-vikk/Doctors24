// 1. Keskmine tasu arstide kohta soo järgi
db.users.aggregate([
    { $match: { role: "DOCTOR" } },
    { $group: {
        _id: "$gender",
        doctors_count: { $sum: 1 },
        avg_rate: { $avg: "$ratePerMinute" }
    }}
]);

// 2. Kasutajate arv erinevate keelte ja rollide lõikes
db.users.aggregate([
    { $unwind: "$spokenLanguages" },
    { $group: {
        _id: {
            role: "$role",
            language: "$spokenLanguages"
        },
        users_count: { $sum: 1 }
    }},
    { $sort: { users_count: -1 } },
    { $limit: 5 }
]);

// 3. Aktiivsed kasutajad, kes räägivad mitut keelt
db.users.find({
    isActive: true,
    $expr: { $gt: [{ $size: "$spokenLanguages" }, 1] }
}, {
    name: 1,
    spokenLanguages: 1,
    _id: 0
}).sort({
    "spokenLanguages": -1
}); 

// Loome kollektsiooni
db.createCollection("users")

// Arstide keskmine vanus
db.users.aggregate([
    // Filtreerime ainult arstid
    { $match: { role: "DOCTOR" } },
    
    // Arvutame keskmise vanuse
    { $group: {
        _id: null,
        keskmine_vanus: { $avg: "$age" },
        arstide_arv: { $sum: 1 }
    }},
    
    // Vormindame väljundi
    { $project: {
        _id: 0,
        keskmine_vanus: { $round: ["$keskmine_vanus", 1] },
        arstide_arv: 1
    }}
]);

/* 
Päringu selgitus:
1. $match - filtreerib välja ainult DOCTOR rolliga kasutajad
2. $group - grupeerib kõik arstid kokku ja arvutab keskmise vanuse
3. $project - vormindab väljundi, ümmardab keskmise vanuse ühe komakohani

Oodatav väljund:
{ "keskmine_vanus": 38.5, "arstide_arv": 2 }
*/
