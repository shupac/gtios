angular.module('GetTogetherApp')
.factory('SessionService', function($http, $q, $location, $timeout) {
  var service = {
    sessionUserID: null,
    sessionUsername: null,
    currentRoom: null,
    roomsList: {}, // list of rooms or 'groups' user belongs to
    usersList: {}, // list of users in the current room upon entering room
    invitesList: [],
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
          service.listenForInvites();
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
      service.stopListenForInvites();
      service.sessionUserID = null;
      service.sessionUsername = null;
      service.currentRoom = null;
      service.roomsList = {};
      service.usersList = {};
      service.invites = [];
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
    },

    invite: function(username, message) {
      var inviteRef = refs.users
        .child(username)
        .child('Invites')
        .child(service.currentRoom);

      inviteRef.once('value', function(invite) {
        if(invite.val()) {
          console.log('user already invited');
          return;
        }
        inviteRef.set({
          invitedBy: service.sessionUsername,
          roomname: service.currentRoom,
          message: message,
          show: true
        });
      });
    },

    listenForInvites: function() {
      refs.users
        .child(service.sessionUsername)
        .child('Invites')
        .on('child_added', function(invite) {
          $timeout(function() {
            var inviteRoom = invite.val().roomname;
            if(!service.roomsList[inviteRoom]) {
              service.invitesList.push(invite.val());
              console.log('user already belongs to room');
            }
          });
        });
    },

    stopListenForInvites: function() {
      refs.users
        .child(service.sessionUsername)
        .child('Invites')
        .off();
    }
  };
  return service;
});