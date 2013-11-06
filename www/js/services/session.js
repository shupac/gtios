angular.module('GetTogetherApp')
.factory('SessionService', function($http, $q, $location) {
  var service = {
    currentUserID: null,
    currentUsername: null,
    currentRoom: null,
    currentRoomsList: [],
    currentUsers: [],
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
          service.getRooms();
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
      service.currentUsername = null;
      service.currentRoom = null;
      $location.path('/login');
    },

    getRooms: function() {
      var defer = $q.defer();
      var username = service.currentUsername;
      refs.users
        .child(username)
        .child('Rooms')
        .once('value', function(rooms) {
          if(rooms.val()) {
            defer.resolve(Object.keys(rooms.val()));
          } else {
            defer.resolve([]);
          }
        });
      return defer.promise;
    },
    getUsers: function() {
      console.log('update currentUsers', service.currentUsers);
      var defer = $q.defer();
      refs.rooms
        .child(service.currentRoom)
        .child('Users')
        .once('value', function(users) {
          if(users.val()) {
            console.log(Object.keys(users.val()));
            service.currentUsers = Object.keys(users.val());
            // defer.resolve(Object.keys(users.val()));
          } else {
            // defer.resolve([]);
            service.currentUsers = [];
          }
        });
      return defer.promise;
    }
  };
  return service;
});