var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
	title: String,
	description: String,
	link: String,
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	upvotes: {type: Number, default:0},
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
	tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
	likers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	dislikers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	created_at: { type : Date, default: Date.now },
	updated_at: { type : Date, default: Date.now }
});

PostSchema.methods.upvote = function(cb){
	this.upvotes ++;
	this.save(cb);
}

mongoose.model('Post', PostSchema);

