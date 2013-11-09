angular.module('GetTogetherApp')
.factory('RoomService', function($http, $q, SessionService, MapService, ChatService) {
  var service = {
    create: function(roomname) {
      var defer = $q.defer();
      var username = SessionService.sessionUsername;
      var newRoomRef = refs.rooms.child(roomname);
      newRoomRef.once('value', function(room) {
        // if roomname is not found
        if(room.val() === null) {
          newRoomRef.set({owner: username});
            SessionService.enterRoom(roomname);
            MapService.initializeMap(roomname);
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
          if(SessionService.currentRoom) { // If currently in a room, stop listeners and delete chats
            service.terminateRoomSession();
            ChatService.messages = [];
          }
          SessionService.enterRoom(roomname);
          MapService.initializeMap(roomname);
          ChatService.initialize();
          defer.resolve();
          console.log(username, 'entered room:', roomname);
        } else {
          defer.reject();
        }
      });
      return defer.promise;
    },
    terminateRoomSession: function() {
      currentRoom = SessionService.currentRoom;
      MapService.stopListeners(currentRoom);
      ChatService.stopListener(currentRoom);
      MapService.terminateMap(currentRoom);
      ChatService.messages = [];
      SessionService.currentRoom = null;
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
    },
    storePosition: function(position) {
      var currentRoom = SessionService.currentRoom;
      var username = SessionService.sessionUsername;
      refs.rooms
        .child(currentRoom)
        .child('Users')
        .child(username)
        .child('position')
        .set({coords: position.coords, timestamp: position.timestamp});
    }
  };
  return service;
});