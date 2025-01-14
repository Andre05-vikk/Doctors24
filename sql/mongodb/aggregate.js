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