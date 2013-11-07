angular.module('GetTogetherApp')
.factory('RoomService', function($http, $q, SessionService, MapService) {
  var service = {
    create: function(roomname) {
      var defer = $q.defer();
      var username = SessionService.getUsername();
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
      var username = SessionService.getUsername();

      roomRef.once('value', function(room) {
        // if the room exists
        if(room.val() !== null) {
          MapService.stopListeners(SessionService.currentRoom);
          SessionService.enterRoom(roomname);
          MapService.initializeMap(roomname);  
          defer.resolve();
          console.log(username, 'entered room:', roomname);
        } else {
          defer.reject();
        }
      });
      return defer.promise;
    },
    leaveRoom: function(roomname) {
      var defer = $q.defer();
      var username = SessionService.getUsername();

      var userRef = refs.rooms
        .child(roomname)
        .child('Users')
        .child(username);

      userRef.once('value', function(user) {
        // if the room exists
        if(user.val() !== null) {
          MapService.stopListeners(roomname);
          userRef.remove();
          defer.resolve();
          // console.log(username, 'entered room:', roomname);
        } else {
          defer.reject();
        }
      });
      return defer.promise;
    },
    storePosition: function(position) {
      var currentRoom = SessionService.currentRoom;
      var username = SessionService.getUsername();
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