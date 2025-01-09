db = db.getSiblingDB('admin');
db.auth('root', 'rootpassword');

db = db.getSiblingDB('doctors24');

db.createUser({
    user: 'user',
    pwd: 'password',
    roles: [{ role: 'readWrite', db: 'doctors24' }]
});

db.users.aggregate([
    { $match: { role: "DOCTOR" } },
    { $group: {
        _id: "$gender",
        doctors_count: { $sum: 1 },
        avg_rate: { $avg: "$ratePerMinute" }
    }}
])