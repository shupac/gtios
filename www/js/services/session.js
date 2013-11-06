angular.module('GetTogetherApp')
.factory('SessionService', function($http, $q, $location) {
  var service = {
    sessionUserID: null,
    sessionUsername: null,
    currentRoom: null,
    roomsList: [],
    usersList: [],
    isLoggedIn: function() {
      return !!service.sessionUserID;
    },

    // get, set userID
    getUserID: function() {
      return service.sessionUserID;
    },
    setUserID: function(userID) {
      service.sessionUserID = userID;
    },

    // get, set username
    getUsername: function() {
      return service.sessionUsername;
    },
    setUsername: function(username) {
      service.sessionUsername = username;
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
          service.updateRoomsList()
          .then(function() {
            console.log(username, 'logged in');
            $location.path('/');            
          });
        } else {
          console.log(data.message);
        }
      })
      .error(function() {
        console.log('signup')
      });
    },
    logout: function() {
      service.sessionUserID = null;
      service.sessionUsername = null;
      service.currentRoom = null;
      service.roomsList = [];
      service.usersList = [];
      $location.path('/login');
    },
    enterRoom: function(roomname) {
      service.currentRoom = roomname;
      service.updateUsersList();
      if(service.roomsList.indexOf(roomname) === -1) {
        service.roomsList.push(roomname);
      }
      refs.users
        .child(service.sessionUsername)
        .child('Rooms')
        .child(roomname)
        .set({update: 'live'});
    },
    updateRoomsList: function() {
      var defer = $q.defer();
      var username = service.sessionUsername;
      refs.users
        .child(username)
        .child('Rooms')
        .once('value', function(rooms) {
          if(rooms.val()) {
            service.roomsList = Object.keys(rooms.val());
            console.log(service.roomsList);
            defer.resolve();
          } else {
            service.roomsList = [];
            defer.reject();
          }
        });
      return defer.promise;
    },
    updateUsersList: function() {
      console.log('******* update users list', service.currentRoom);

      refs.rooms
        .child(service.currentRoom)
        .child('Users')
        .once('value', function(users) {
          if(users.val()) {
            console.log('*************', users.val());
            console.log(Object.keys(users.val()));
            service.usersList = Object.keys(users.val());
            console.log('update sessionUsers', service.usersList);
          } else {
            service.usersList = [];
          }
        });
    }
  };
  return service;
});