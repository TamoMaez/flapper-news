var mongoose = require('mongoose');

var TagSchema = new mongoose.Schema({
	name: String,
	description: String,
	posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}]
})

mongoose.model('Tag', TagSchema);