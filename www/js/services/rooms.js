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
            newRoomRef.child('Users').child(username).set({active: true});
            refs.users
              .child(username)
              .child('Rooms')
              .child(roomname)
              .set({update: 'live'});
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
          refs.users
            .child(username)
            .child('Rooms')
            .child(roomname)
            .set({update: 'live'});
          console.log('logged into room:', roomname);
          defer.resolve();
          MapService.initializeMap(roomname);
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
    },
    getRooms: function() {
      var defer = $q.defer();
      console.log('getRooms');
      var username = SessionService.getUsername();
      refs.users
        .child(username)
        .child('Rooms')
        .once('value', function(rooms) {
          if(rooms.val()) {
            defer.resolve(Object.keys(rooms.val()));
          }
        });
      return defer.promise;
    }
  };
  return service;
});