const User = require('../models/User');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/authentication');

// Update user
router.put('/me', authMiddleware.loginrequired, async (req, res) => {
	try {
		const userId = req.userId;
		let user = await User.findByIdAndUpdate(
			userId,
			{
				// Auto set the inputs inside the body
				$set: req.body
			},
			{ new: true }
		);
		user = await User.findById(userId);
		res.status(200).json({ message: 'Account has been updated!', user });
	} catch (err) {
		return res.status(500).json(err);
	}
});

// Delete user
router.delete('/:id', async (req, res) => {
	if (req.body.userId === req.params.id || req.body.isAdmin) {
		try {
			await User.findByIdAndDelete({ _id: req.params.id });
			res.status(200).json('Account has been deleted!');
		} catch (err) {
			return res.status(500).json(err);
		}
	} else {
		return res.status(403).json('You can only delete your account!');
	}
});

//get a user
router.get('/', async (req, res) => {
	const userId = req.query.userId;
	const username = req.query.username;
	try {
		const user = userId ? await User.findById(userId) : await User.findOne({ username: username });
		const { password, updatedAt, ...other } = user._doc;
		res.status(200).json(other);
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET Friends
router.get('/friends/:userId', async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);
		const friends = await Promise.all(
			user.followings.map((friendId) => {
				return User.findById(friendId);
			})
		);
		let friendList = [];
		friends.map((friend) => {
			const { _id, username, profilePicture } = friend;
			friendList.push({ _id, username, profilePicture });
		});
		res.status(200).json(friendList);
	} catch (err) {
		res.status(500).json(err);
	}
});

// Follow a user
router.put('/:id/follow', async (req, res) => {
	if (req.body.userId !== req.params.id) {
		try {
			const user = await User.findById(req.params.id);
			const currentUser = await User.findById(req.body.userId);
			if (!user.followings.includes(req.body.userId)) {
				console.log('here 1');
				await user.updateOne({ $push: { followings: req.body.userId } });
				await currentUser.updateOne({ $push: { followers: req.params.id } });
				res.status(200).json({ message: 'User has been followed', currentUser });
			} else {
				console.log('here 2');
				await user.updateOne({ $pull: { followings: req.body.userId } });
				await currentUser.updateOne({ $pull: { followers: req.params.id } });
				res.status(200).json({ message: 'You unfollow this user', currentUser });
			}
		} catch (err) {
			console.log('ERROR');
			res.status(500).json(err);
		}
	} else {
		res.status(403).json('You cant follow yourself');
	}
});

// Unfollow a user
// router.put('/:id/unfollow', async (req, res) => {
// 	if (req.body.userId !== req.params.id) {
// 		try {
// 			const user = await User.findById(req.params.id);
// 			const currentUser = await User.findById(req.body.userId);
// 			if (user.followers.includes(req.body.userId)) {
// 				await user.updateOne({ $pull: { followers: req.body.userId } });
// 				await currentUser.updateOne({ $pull: { followings: req.params.id } });
// 				res.status(200).json('User has been unfollowed');
// 			} else {
// 				res.status(403).json('You dont follow this user');
// 			}
// 		} catch (err) {
// 			res.status(500).json(err);
// 		}
// 	} else {
// 		res.status(403).json('you cant unfollow yourself');
// 	}
// });

// Find a user
router.get('/find/:username', async (req, res) => {
	try {
		const user = await User.find({ username: { $regex: req.params.username } });
		res.status(200).json(user);
	} catch (err) {
		res.status(404).json(err);
	}
});

module.exports = router;
