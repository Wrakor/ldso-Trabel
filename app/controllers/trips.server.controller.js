'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors'),
  Trip = mongoose.model('Trip'),
  User = mongoose.model('User'),
  _ = require('lodash'),
  config = require('../../config/config'),
  nodemailer = require('nodemailer'),
  crypto = require('crypto'),
  async = require('async');



/**
 * Create a Trip
 */
exports.create = function(req, res) {

	var trip = new Trip(req.body);
	trip.user = req.user;



	trip.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(trip);
		}
	});

	console.log('Initializing socketio');
	var socketio = req.app.get('socketio');
	var tripSocket = socketio.of('/' + trip._id);
	tripSocket.on('connection', function(socket){
		
		socket.on('sendUpdate', function(data){
			socket.broadcast.emit('gotUpdate', {});
		});
	});
	
};

/**
 * Show the current Trip
 */
exports.read = function(req, res) {
  res.jsonp(req.trip);
};

/**
 * Update a Trip
 */
exports.update = function(req, res) {
  console.log('STEP - update');
  var trip = req.trip;

  trip = _.extend(trip, req.body);

  trip.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(trip);
    }
  });
};


/**
 * Delete an Trip
 */
exports.delete = function(req, res) {
  var trip = req.trip;

  trip.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(trip);
    }
  });
};

exports.topTrips = function(req, res) {
  Trip.find({
    privacy: 1
  }).sort({
    likes: -1
  }).limit(6).populate('user', 'displayName').exec(function(err, trips) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(trips);
    }
  });
};


/**
 * List of Trips
 */
exports.list = function(req, res) {
  Trip.find({
    $or: [{
      'user': req.user._id
    }, {
      'privacy': 1
    }, {
      'members.user': req.user._id
    }]
  }).sort('-created').populate('user', 'displayName').exec(function(err, trips) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(trips);
    }
  });
};


/**
 * Search Trips
 */
exports.search = function(req, res) {

  var regex = new RegExp(req.body.pattern, 'i');
  //var name_regex = new RegExp(req.body.tripName, 'i');
  //var places = req.body.places;
  //var ownerName = new RegExp(req.body.owner.name, 'i');
  //var ownerEmail = new RegExp(req.body.owner.email, 'i');

  var users_temp;
  console.log('querying DB'); //TODO general search that finds users and trips by name, email or members based on 'pattern regex'
  Trip.find({
      'name': {
        $regex: regex
      },
      'privacy': 1
    })
    .populate('user members.user', 'displayName email')
    .exec(function(err, trips) {
      if (err) {
        res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        var result;
        if (typeof users_temp !== 'undefined')
          result = users_temp.concat(trips);
        else
          result = trips;

        res.json(result);
        //console.log("result:", result);
      }
    });

  User.find({
      'displayName': {
        $regex: regex
      }
    })
    .populate('user', 'displayName')
    .exec(function(err, users) {
      if (err) {
        res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        users_temp = users;
      }
    });
};

/**
 *	Invite a mate for the trip
 */
exports.inviteMate = function(req, res) {

  //once Notification system is up, notify user as well
  console.log('inviteMate');
  console.log(req);
  async.waterfall([

    function(done) {
      res.render('templates/invite-mate', {
        appName: config.app.title,
        invitedUser: req.resolvedUser.displayName,
        tripOwner: req.user.displayName,
        tripName: req.trip.name,
        acceptURL: 'http://' + req.headers.host + '/trips/' + req.trip._id + '/add/mate/' + req.resolvedUser._id,
        declineURL: 'http://' + req.headers.host + '/trips/' + req.trip._id + '/decline/invitation/' + req.resolvedUser._id
      }, function(err, emailHTML) {
        done(err, emailHTML);
      });
    },
    function(emailHTML, done) {
      var smtpTransport = nodemailer.createTransport(config.mailer.options);
      var mailOptions = {
        to: req.resolvedUser.email,
        from: config.mailer.from,
        subject: 'Request to Join',
        html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if (!err) {
          res.send({
            message: req.resolvedUser.displayName + ' has been invited to join the trip'
          });
        }
        done(err);
      });
    }
  ], function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
  });

};

exports.requestJoin = function(req, res) {
  console.log('Request Join');

  User.findById(req.trip.user._id).select('displayName email').exec(function(err, usr) { //maybe just populate email on TripByID?
    async.waterfall([

      function(done) {
        res.render('templates/request-joining', {
          appName: config.app.title,
          requestingUser: req.user.displayName,
          tripOwner: usr.displayName,
          tripName: req.trip.name,
          acceptURL: 'http://' + req.headers.host + '/trips/' + req.trip._id + '/add/mate/' + req.user._id,
          declineURL: 'http://' + req.headers.host + '/trips/' + req.trip._id + '/decline/join/request' + req.user._id
        }, function(err, emailHTML) {
          done(err, emailHTML);
        });
      },
      function(emailHTML, done) {
        var smtpTransport = nodemailer.createTransport(config.mailer.options);
        var mailOptions = {
          to: usr.email,
          from: config.mailer.from,
          subject: 'Trip Invitation',
          html: emailHTML
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          if (!err) {
            res.send({
              message: 'A request to join the trip has been sent to ' + usr.displayName
            });
          }
          done(err);
        });
      }
    ], function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
    });
  });
};


exports.declineInvitation = function(req, res) {
  //once Notification system is up, notify user as well

};

exports.clone = function(req, res) {
  var newTrip = {
    markers: req.trip.markers,
    name: 'Copy of ' + req.trip.name
  };
  var trip = new Trip(newTrip);
  trip.user = req.user;

  trip.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(trip);
    }
  });
};


/**
 * Trip middleware
 */
exports.tripByID = function(req, res, next, id) {

  console.log('STEP - tripByID');
  Trip.findById(id).populate('user members.user', 'displayName').exec(function(err, trip) {
    if (err) return next(err);
    if (!trip) return next(new Error('Failed to load Trip ' + id));

    req.trip = trip;
    next();
  });
};

exports.userByID = function(req, res, next, id) {
  console.log('STEP - userByID');

  User.findById(id).exec(function(err, usr) {
    req.resolvedUser = usr;
    next();
  });
};

exports.addTripMate = function(req, res) {

  console.log('STEP - addTripMate');
  var member = {
    user: req.resolvedUser._id,
    permission: 'write'
  };
  req.trip.members.push(member);


  var trip = req.trip;
  trip = _.extend(trip, req.body);

  trip.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.redirect('/#!/trips/' + trip._id);
    }
  });


};

exports.removeMate = function(req, res, next) {

  var index = 0;

  req.trip.members.forEach(function(member) {
    if (member.user._id === req.user._id) {
      index = req.trip.members.indexOf(member);
    }
  });
  console.log('before splice');
  console.log(req.trip.members);
  req.trip.members.splice(index, 1);
  console.log('after splice');
  console.log(req.trip.members);
  next();

};

/**
 * Trip authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  console.log('STEP - hasAuthorization');
  if (req.trip.user.id !== req.user.id) {
    var authorized = false;
    console.log(req.trip.members);
    console.log(req.user);
    req.trip.members.forEach(function(member) {
      console.log('member id');
      console.log(member.user.id);
      console.log('user id');
      console.log(req.user.id);
      if (member.user.id === req.user.id) {
        authorized = true;
      }
    });

    if (!authorized) {
      console.log('not authorized');
      return res.status(403).send('User is not authorized');
    }
  }
  next();
};
