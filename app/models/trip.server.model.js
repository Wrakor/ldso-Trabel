'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var memberInfo = new Schema({

	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	//read/write/admin
	permission: {
		type: String,
		default: 'write'
	}
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
		type: [memberInfo],
		default: []
	},
	//0-private,1-public
	privacy: {
		type: Number,
		default: 0
	},
	markers: {
		type: Array
	}
});

mongoose.model('Trip', TripSchema);
