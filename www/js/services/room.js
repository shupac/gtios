angular.module('GetTogetherApp')
.factory('RoomService', function($http, $q, SessionService, MapService, ChatService) {
  var service = {
    initialize: function(roomname) {
      var defer = $q.defer();
      SessionService.initialize(roomname); // initializes room session for current room
      MapService.initialize(roomname)
      .then(function() {
        defer.resolve();
      }); // initializes map for current room
      ChatService.initialize(); // initializes chat for current room
      return defer.promise;
    },
    create: function(roomname) {
      var defer = $q.defer();
      var username = SessionService.sessionUsername;
      var newRoomRef = refs.rooms.child(roomname);
      newRoomRef.once('value', function(room) {

        // if roomname is not found
        if(room.val() === null) {
          newRoomRef.set({owner: username});
          service.initialize(roomname);
          defer.resolve(roomname);
          console.log(roomname, 'created');
        } else {
          defer.reject();
        }
      });
      return defer.promise;
    },

    joinRoom: function(roomname) {
      var defer = $q.defer();
      var roomRef = refs.rooms.child(roomname);
      var username = SessionService.sessionUsername;
      roomRef.once('value', function(room) {

        // if the room exists
        if(room.val() !== null) {

          // If currently in a room, terminate current room
          if(SessionService.currentRoom) {
            service.terminateRoomSession();
          }

          service.initialize(roomname)
          .then(function() {
            defer.resolve();
          });
          console.log(username, 'entered room:', roomname);
        } else {
          defer.reject();
        }
      });
      return defer.promise;
    },

    terminateRoomSession: function() {
      currentRoom = SessionService.currentRoom;
      MapService.terminateMap(currentRoom);
      // MapService.stopListeners(currentRoom);
      ChatService.stopListener(currentRoom);
      ChatService.messages = [];
      SessionService.leaveCurrentRoom();
    },

    deleteRoom: function(roomname) {
      var defer = $q.defer();
      var username = SessionService.sessionUsername;

      var userRef = refs.rooms
        .child(roomname)
        .child('Users')
        .child(username);

      userRef.once('value', function(user) {
        // if the room exists
        if(user.val() !== null) {
          userRef.remove();
          SessionService.deleteRoom(roomname);
          if(SessionService.currentRoom === roomname) {
            service.terminateRoomSession();
          }
          defer.resolve();
        } else {
          defer.reject();
        }
      });
      return defer.promise;
    }
  };
  return service;
});