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
