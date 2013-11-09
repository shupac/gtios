angular.module('GetTogetherApp')
.factory('SessionService', function($http, $q, $location, $timeout) {
  var service = {
    sessionUserID: null,
    sessionUsername: null,
    currentRoom: null,
    roomsList: {},
    usersList: {},
    isLoggedIn: function() {
      return !!service.sessionUserID;
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
          service.sessionUserID = data.id;
          service.sessionUsername = username;
          service.updateRoomsList();
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
      service.sessionUserID = null;
      service.sessionUsername = null;
      service.currentRoom = null;
      service.roomsList = [];
      service.usersList = [];
      $location.path('/login');
    },
    enterRoom: function(roomname) {
      service.currentRoom = roomname;
      service.syncUpdateType(roomname, 'live');
      service.updateUsersList();
    },
    leaveCurrentRoom: function() {
      refs.rooms
        .child(service.currentRoom)
        .child('Users')
        .off();
      $timeout(function() {
        service.usersList = {};
      });
      service.currentRoom = null;
    },
    updateRoomsList: function() {
      service.roomsList = {};
      var username = service.sessionUsername;
      refs.users
        .child(username)
        .child('Rooms')
        .on('child_added', function(room) {
          var roomname = room.name();
          var updateType = room.val().update;
          $timeout(function() {
            service.roomsList[roomname] = {name: roomname, update: updateType};
          });
        });
    },
    updateUsersList: function() {
      var defer = $q.defer();
      refs.rooms
        .child(service.currentRoom)
        .child('Users')
        .on('value', function(users) {
          console.log(users.val());
          $timeout(function() {
            service.usersList = users.val();
          });
          defer.resolve();
        });
      return defer.promise;
    },
    deleteRoom: function(roomname) {
      $timeout(function() {
        delete service.roomsList[roomname];
      });
      refs.users
        .child(service.sessionUsername)
        .child('Rooms')
        .child(roomname)
        .remove();
    },
    addUserToList: function(username) {
      service.usersList.push(username);
    },
    removeUserFromList: function(username) {
      for(var i = 0; i < service.usersList.length; i++) {
        if(service.usersList[i] === username) {
          service.usersList.splice(i, 1);
        }
      }
    },
    syncUpdateType: function(roomname, updateType) {
      var username = service.sessionUsername;
      refs.users
        .child(username)
        .child('Rooms')
        .child(roomname)
        .set({update: updateType}, function(error) {
          if(error) {
            console.log('error');
          } else {
            console.log(roomname, updateType);
            service.updateRoomsList();
          }
        });
    }
  };
  return service;
});