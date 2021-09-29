const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = {};

authMiddleware.loginrequired = async (req, res, next) => {
	try {
		//1. get the token request
		const tokenString = req.headers.authorization;

		if (!tokenString) {
			throw new Error('Token not found');
		}
		const token = tokenString.replace('Bearer ', '');
		//2. check the token exits (1. Verify token by jwt(endcode). 2. Make callback function)
		jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
			if (err) {
				if (err.name == 'TokenExpiredError') {
					throw new Error('Token Expried');
				} else {
					throw new Error('Token invalid');
				}
			}
			req.userId = payload._id; // this id we were use when we make jwt token to endcode the token with generatetoken, so we can use here again
		});
		//3.next step
		next();
	} catch (err) {
		res.status(400).json({
			success: false,
			error: err.message
		});
	}
};
authMiddleware.adminRequired = async (req, res, next) => {
	try {
		const userId = req.userId;
		const currentUser = await User.findById(userId);
		const isAdmin = currentUser.role === 'admin';
		if (!isAdmin) {
			throw new Error('Admin Required');
		}
		req.isAdmin = isAdmin;

		next();
	} catch (err) {
		res.status(400).json({
			success: false,
			error: err.message
		});
	}
};
module.exports = authMiddleware;
