angular.module('GetTogetherApp')
.factory('SessionService', function($http, $q, $location) {
  var service = {
    currentUserID: null,
    currentUsername: null,
    currentRoom: null,
    isLoggedIn: function() {
      return !!service.currentUserID;
    },

    // get, set userID
    getUserID: function() {
      return service.currentUserID;
    },
    setUserID: function(userID) {
      service.currentUserID = userID;
    },

    // get, set username
    getUsername: function() {
      return service.currentUsername;
    },
    setUsername: function(username) {
      service.currentUsername = username;
    },

    getCurrentRoom: function() {
      return service.currentRoom;
    },

    // signup and login
    signup: function(username, password) {
      service.submitCred(username, password, 'signup');
    },
    login: function(username, password) {
      service.submitCred(username, password, 'login');
    },
    submitCred: function(username, password, type) {
      var url;
      if(type === 'login') {
        url = '/login';
        // url = 'http://gettogetherapp.herokuapp.com/login';
      }
      if(type === 'signup') {
        url = '/signup';
        // url = 'http://gettogetherapp.herokuapp.com/signup';
      }

      // console.log(type + ': ', username, password);
      $http({
        url: url,
        method: 'POST',
        data: {
          username: username,
          password: password
        }
      })
      .success(function(data) {
        if(data.success) {
          service.setUserID(data.id);
          service.setUsername(username);
          console.log(username, 'logged in');
          service.fetchRooms();
          $location.path('/');
        } else {
          console.log(data.message);
        }
      })
      .error(function() {
        console.log('signup')
      });
    },
    logout: function() {
      service.currentUserID = null;
      refs.users.off();
      refs.users.child(service.currentUsername).child('position').remove();
      $location.path('/login');
    },

    fetchRooms: function() {
      var defer = $q.defer();
      refs.rooms.once('value', function(rooms) {
        if(rooms.val() !== null) {
          service.roomsList = Object.keys(rooms.val());
        } else {
          service.roomsList = [];
        }
        defer.resolve(service.roomsList);
      });
      return defer.promise;
    }
  };
  return service;
});