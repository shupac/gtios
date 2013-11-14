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
            SessionService.initialize(roomname);
            MapService.initialize(roomname);
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
        
        if(room.val() !== null) { // if the room exists

          // If currently in a room, terminate current room
          if(SessionService.currentRoom) {
            service.terminateRoomSession();
          }
          SessionService.initialize(roomname); // initializes room session for current room
          MapService.initialize(roomname); // initializes map for current room
          ChatService.initialize(); // initializes chat for current room

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
      // MapService.stopListeners(currentRoom);
      MapService.terminateMap(currentRoom);
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

    // storePosition: function(position) {
    //   var currentRoom = SessionService.currentRoom;
    //   var username = SessionService.sessionUsername;
    //   refs.rooms
    //     .child(currentRoom)
    //     .child('Users')
    //     .child(username)
    //     .child('position')
    //     .set({coords: position.coords, timestamp: position.timestamp});
    // }
  };
  return service;
});