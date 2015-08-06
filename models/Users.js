var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
	username: {type: String, lowercase:true, unique: true},
	hash: String,
	salt: String,
	firstname: String,
	lastname: String,
	email: {type: String, lowercase:true},
	avatar: String,
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
	created_at: { type : Date, default: Date.now },
	updated_at: { type : Date, default: Date.now }
});

UserSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
}

UserSchema.methods.validPassword = function(password){
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	return this.hash === hash;
}

UserSchema.path('email').validate(function (email) {
	var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
   return emailRegex.test(email);
}, 'The e-mail field cannot be empty.')

UserSchema.methods.generateJWT = function(){
	//set expiration to 60 days
	var exp = new Date();
	exp.setDate(exp.getDate() + 60);
	
	//jwt.sign(payload, secret_to_sign_tokens)
	return jwt.sign({
		_id: this._id,
		username: this.username,
		exp: parseInt(exp.getTime() / 1000)
	}, 'SECRET'); // it is strongly recommended that you use an environment variable for referencing the secret and keep it out of your codebase.
}

mongoose.model('User', UserSchema);