const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middlewares/authentication');

// REGISTER
router.post('/register', async (req, res) => {
	try {
		// BCRYPT the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		// Create new User
		const newUser = new User({
			username: req.body.username,
			email: req.body.email,
			password: hashedPassword
		});

		// Save user and respond
		const user = await newUser.save();
		res.status(200).json(user);
	} catch (err) {
		res.status(500).json(err);
	}
});

// LOGIN
router.post('/login', async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });

		// Check user
		!user && res.status(404).json('User not found!');

		const validPassword = await bcrypt.compare(req.body.password, user.password);
		// Check password
		!validPassword && res.status(404).json('Wrong Password!');

		const accessToken = await user.generateToken();
		res.status(200).json({ user, accessToken });
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
});

// GET ME
router.get('/me', authMiddleware.loginrequired, async (req, res) => {
	try {
		const userId = req.userId;
		const user = await User.findById(userId);

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
