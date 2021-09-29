const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');
const commentRoute = require('./routes/comments');
const conversationRoute = require('./routes/conversations');
const messageRoute = require('./routes/messages');
const router = express.Router();
const multer = require('multer');
const path = require('path');
var cors = require('cors');

dotenv.config();

mongoose.connect(process.env.MONGO_URL, () => {
	console.log('Connected to MongoDB!');
	console.log('');
});

app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use(cors());

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public/images');
	},
	filename: (req, file, cb) => {
		cb(null, req.body.name);
	}
});

const upload = multer({ storage: storage });
app.post('/api/upload', upload.single('file'), (req, res) => {
	try {
		return res.status(200).json('File uploded successfully');
	} catch (error) {
		console.error(error);
	}
});

app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/messages', messageRoute);
app.use('/api/comments', commentRoute);

app.listen(8800, () => {
	console.log('Backend Server is running on PORT:8800!');
});
