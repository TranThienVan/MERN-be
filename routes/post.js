const Post = require('../models/Post');
const router = require('express').Router();
const User = require('../models/User');

// CREATE a post
router.post('/', async (req, res) => {
	const newPost = new Post(req.body);

	try {
		const savedPost = await newPost.save();
		res.status(200).json(savedPost);
	} catch (err) {
		res.status(500).json(err);
	}
});

// UPDATE a post
router.put('/:id', async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (post.userId == req.body.userId) {
			await post.updateOne({ $set: req.body });
			res.status(200).json('The post has been updated');
		} else {
			res.status(403).json('You can update only your Post');
		}
	} catch (err) {
		res.status(500).json(err);
	}
});

// DELETE a post
router.delete('/:id', async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (post.userId == req.body.userId) {
			await post.deleteOne();
			res.status(200).json('The post has been deleted');
		} else {
			res.status(403).json('You can delete only your Post');
		}
	} catch (err) {
		res.status(500).json(err);
	}
});

// LIKE, DISLIKE a post
router.put('/:id/like', async (req, res) => {
	try {
		let post = await Post.findById(req.params.id);
		if (!post.likes.includes(req.body.userId)) {
			post = await Post.findByIdAndUpdate(req.params.id, { $push: { likes: req.body.userId } }, { new: true });
			res.status(200).json({ message: 'The post has been liked', post });
		} else {
			post = await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.body.userId } }, { new: true });
			res.status(200).json({ message: 'The post has been disliked', post });
		}
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET Timeline posts
// If trying to fetch some data using GET, using params
// Sort by date
router.get('/timeline/:userId', async (req, res) => {
	try {
		const currentUser = await User.findById(req.params.userId);
		const userPosts = await Post.find({ userId: currentUser._id })
			.limit(20)
			.populate({ path: 'comments', populate: 'userId' });

		const friendPosts = await Promise.all(
			currentUser.followings.map((friendId) => {
				return Post.find({ userId: friendId }).populate({ path: 'comments', populate: 'userId' });
			})
		);
		res.status(200).json(userPosts.concat(...friendPosts));
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET a post
router.get('/:id', async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		res.status(200).json(post);
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET user's all posts
// If trying to fetch some data using GET, using params
router.get('/profile/:username', async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username });
		const posts = await Post.find({ userId: user._id });
		res.status(200).json(posts);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
