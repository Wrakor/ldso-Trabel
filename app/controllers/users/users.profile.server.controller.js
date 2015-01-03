'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else if(!req.noLogin){

				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.jsonp(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.jsonp(req.user || null);
};


/*
 * Find one user
 */
exports.findUser = function(req, res){
	res.jsonp(req.profile);
};


/*
 * Send all user data
 */
exports.all = function(req, res) {
	User.find({}, function(err, users) {

		if(err){
			res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
	    var users_list = [];
	    users.forEach(function(user) {
	      users_list.push(user);
	    });
	    res.send(users_list);
    }
  });
};
exports.list_by_name = function(req, res) {
	User.find({}, function(err, users) {

		if(err){
			res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
	    var users_list = {};
	    users.forEach(function(user) {
	    	var info = {
	    		id: user._id,
	    		email: user.email
	    	};
	    	users_list[user.displayName] = info;
	    });
	    res.send(users_list);
    }
  });
};
exports.list_by_email = function(req, res) {
	User.find({}, function(err, users) {

		if(err){
			res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
	    var users_list = {};
	    users.forEach(function(user) {
	    	var info = {
	    		id: user._id,
	    		name: user.displayName
	    	};
	    	users_list[user.email] = info;
	    });
	    res.send(users_list);
    }
  });
};
exports.list = function(req, res) {

	console.log('cenas');
	User.find({}, function(err, users) {

		if(err){
			res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
	    var users_list = [];
	    users.forEach(function(user) {
	    	var user_info = {
	    		id: user._id,
	    		name: user.displayName,
	    		email: user.email
	    	};
	    	users_list.push(user_info);
	    });
	    res.send(users_list);
    }
  });
};
exports.search = function(req, res){

var re = new RegExp(req.body.pattern, 'i');
var excludeList = [];

req.body.members.forEach(function(member){
	if(member.user._id === undefined){
		excludeList.push(member.user);
	}else{
	 	excludeList.push(member.user._id);
	}
});
excludeList.push(req.user._id);



User.find().or([{ 'displayName': { $regex: re }},
							  { 'email': { $regex: re }}])
					 .where('_id').nin(excludeList)
					 .select('displayName email')
					 .exec(function(err, users) {
							if(err){
								res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							}else{
						    res.json(users);
					    }
						});
};

function messageBuilder(req){

	var message = req.body;
	message.receiver = req.profile._id;
	message.sender = req.user._id;
	message.date = Date.now();
	message.read = false;

	return message;

}


exports.addReceivedMessage = function(req, res, next){

	var message = messageBuilder(req);
	//console.log(message);

	req.noLogin = true;
	User.findById(req.profile._id).exec(function(err, user){
		user.messages_received.push(message);
		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}else{
				req.user = user;
				next();
			}
		});
	});
};

exports.addSentMessage = function(req, res, next){

	var message = messageBuilder(req);
	//console.log(message);


	User.findById(req.user._id).exec(function(err, user){
		user.messages_sent.push(message);
		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}else{
				req.user = user;
				next();
			}
		});
	});
};

exports.messageByID = function(req, res, next, ID) {

	var index, msg;

	for (index in req.user.messages_received) {
		msg = req.user.messages_received[index];

		if (msg._id === ID) {
			break;
		}
	}

	console.log(ID);
	req.middleware = {index: index};
	next();
};

exports.deleteReceivedMessage = function(req, res, next) {

	User.findById(req.user._id).exec(function(err, user){
			user.messages_received.splice(req.middleware.index, 1);
			user.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}else{
					req.user = user;
					next();
				}
			});
		});
};

exports.getMessages = function(req, res){

	User.findById(req.user._id)
			.populate('messages_sent.sender messages_sent.receiver messages_received.sender messages_received.receiver',
								 'displayName')
			.exec(function(err, user){

				if(err){
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}else{
					res.jsonp(user);
				}
			});
};
