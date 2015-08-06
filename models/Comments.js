var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	body: String,
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	upvotes: {type: Number, default:0},
	post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
	created_at: { type : Date, default: Date.now },
	updated_at: { type : Date, default: Date.now }
})

CommentSchema.methods.upvote = function(cb){
	this.upvotes ++;
	this.save(cb);
}

mongoose.model('Comment', CommentSchema);