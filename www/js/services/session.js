angular.module('GetTogetherApp')
.factory('SessionService', function($http, $q, $location, $timeout) {
  var service = {
    sessionUserID: null,
    sessionUsername: null,
    currentRoom: null,
    roomsList: {}, // list of rooms or 'groups' user belongs to
    usersList: {}, // list of users in the current room upon entering room
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
        console.log('signup error')
      });
    },

    logout: function() {
      service.sessionUserID = null;
      service.sessionUsername = null;
      service.currentRoom = null;
      service.roomsList = {};
      service.usersList = {};
      $location.path('/login');
    },

    initialize: function(roomname) {
      service.currentRoom = roomname;
      service.syncUpdateType(roomname, 'live');
      service.updateUsersList();
    },

    leaveCurrentRoom: function() {
      // turns off users list listeners for Firebase updates
      refs.rooms
        .child(service.currentRoom)
        .child('Users')
        .off();
      $timeout(function() {
        service.usersList = {};
      });
      service.currentRoom = null;
    },

    // retrieves list of rooms user belongs to and sets up listeners for Firebase updates
    updateRoomsList: function() {
      var username = service.sessionUsername;
      refs.users
        .child(username)
        .child('Rooms')
        .on('value', function(rooms) {
          service.roomsList = {};
          $timeout(function(){
            for(key in rooms.val()) {
              service.roomsList[key] = {name: key, update: rooms.val()[key].update};
            }
          });
        });
    },

    // updates list of users in current room and sets up listeners for Firebase updates
    updateUsersList: function() {
      var defer = $q.defer();
      refs.rooms
        .child(service.currentRoom)
        .child('Users')
        .on('value', function(users) {
          $timeout(function() {
            service.usersList = users.val();
          });
          defer.resolve();
        });
      return defer.promise;
    },

    // removes the room from the user's list of rooms
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

    // udpates the udpate property for the room in the user's room list
    syncUpdateType: function(roomname, updateType) {
      var username = service.sessionUsername;
      refs.users
        .child(username)
        .child('Rooms')
        .child(roomname)
        .set({update: updateType});
    }
  };
  return service;
});