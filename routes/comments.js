const authMiddleware = require('../middlewares/authentication');
const Post = require('../models/Post');
const router = require('express').Router();
const User = require('../models/User');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

// CREATE Comment
router.post('/', authMiddleware.loginrequired, async (req, res) => {
	try {
		const userId = req.userId;

		const { postId, content } = req.body;
		const comment = await Comment.create({
			userId,
			postId,
			content
		});
		await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

		res.status(200).json('Create new comment');
	} catch (err) {
		res.status(500).json(err);
	}
});

// Update Comment
router.put('/:id', authMiddleware.loginrequired, async (req, res) => {
	try {
		const { postId, content } = req.body;
		const userId = req.userId;
		const commentId = req.params.id;
		let comment = await Comment.findById(commentId);
		if (comment.userId !== mongoose.Types.ObjectId(userId)) res.status(400).json("you can't update this comment");
		comment = await Comment.findOneAndUpdate({
			userId,
			postId,
			content
		});

		res.status(200).json('Update comment');
	} catch (err) {
		res.status(500).json(err);
	}
});

// DELETE a post
router.delete('/:id', authMiddleware.loginrequired, async (req, res) => {
	try {
		const commentId = req.params.id;
		const comment = await Comment.findOneAndRemove(commentId);

		res.status(200).json('Delete comment');
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
