'use strict';

module.exports = function(app) {
  // Root routing
  var users = require('../../app/controllers/users');
  var trips = require('../../app/controllers/trips');
  var core = require('../../app/controllers/core');
  app.route('/').get(core.index);
  app.route('/dashboard/getTopTrips')
    .get(users.requiresLogin, trips.topTrips);
};
