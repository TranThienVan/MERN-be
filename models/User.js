const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			require: true,
			min: 3,
			max: 20,
			unique: true
		},
		email: {
			type: String,
			required: true,
			max: 50,
			unique: true
		},
		password: {
			type: String,
			required: true,
			min: 6
		},
		profilePicture: {
			type: String,
			default: ''
		},
		coverPicture: {
			type: String,
			default: ''
		},
		followers: {
			type: Array,
			default: []
		},
		followings: {
			type: Array,
			default: []
		},
		isAdmin: {
			type: Boolean,
			default: false
		},
		desc: {
			type: String,
			max: 50
		},
		city: {
			type: String,
			max: 50
		},
		from: {
			type: String,
			max: 50
		},
		relationship: {
			type: Number,
			enum: [ 1, 2, 3 ]
		}
	},
	{
		timestamps: true
	}
);

UserSchema.methods.generateToken = async function() {
	const accessToken = await jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, {
		expiresIn: '7d'
	});

	return accessToken;
};

module.exports = mongoose.model('User', UserSchema);
