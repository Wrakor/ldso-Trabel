'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  assert = require('assert'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Message = mongoose.model('Message');

/**
 * Globals
 */
var user, user2, user3, message,
users = require('../../app/controllers/users');
/**
 * Unit tests
 */
describe('User Model Unit Tests:', function() {
	before(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			password: 'password',
			provider: 'local'
		});
		user2 = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			password: 'password',
			provider: 'local'
		});
		user3 = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'invalid@EMAIL',
			password: 'password',
			provider: 'local'
		});

		done();
	});

	describe('Method Save', function() {
		it('should begin with no users', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(0);
				done();
			});
		});

		it('should be able to save without problems', function(done) {
			user.save(done);
		});

		it('should fail to save an existing user again', function(done) {
			user.save();
			return user2.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without email', function(done) {
			user.email = '';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with invalid email', function(done) {
			return user3.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	after(function(done) {
		User.remove().exec();
		done();
	});
});
