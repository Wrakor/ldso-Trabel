'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;



var TripMember = new Schema({
		user:{
			type: Schema.ObjectId,
			ref: 'User'
		},
		permission: {
			type: String,
			default: 'write'
		}
	},{
	  _id: false
	});

/**
 * Trip Schema
 */
var TripSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Trip name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	members: {
		type: [TripMember],
		default: []
	},
	//0-private,1-public
	privacy: {
		type: Number,
		default: 0
	},
	markers: {
		type: Array
	},

	startDate: {
		type: Date,
		default: Date.now
	},
	likes: {
		type: Number,
		default: 0
	},
	usersThatLiked: {
		type: [String],
		ref: []
	},
	endDate: {
		type: Date,
		default: Date.now //create some function that adds say 10 years to current date
	}
});

mongoose.model('Trip', TripSchema);
mongoose.model('TripMember', TripMember);
