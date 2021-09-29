const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
	{
		content: {
			type: String
		},
		userId: {
			type: mongoose.Types.ObjectId,
			ref: 'User'
		},
		postId: {
			type: mongoose.Types.ObjectId,
			ref: 'Post'
		}
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model('Comment', CommentSchema);
