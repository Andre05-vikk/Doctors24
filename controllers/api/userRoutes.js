const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.post('/signup', async (req, res) => {
    try {
        // Check if email already exists
        const existingUser = await User.findOne({
            where: { email: req.body.email }
        });

        if (existingUser) {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }

        // Create new user
        const userData = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            gender: req.body.gender,
            age: req.body.age,
            languages: req.body.languages,
            location: req.body.location,
            rate: req.body.rate
        });

        // Set up session
        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.logged_in = true;
            res.status(200).json(userData);
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 