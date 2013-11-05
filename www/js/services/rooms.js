angular.module('GetTogetherApp')
.factory('RoomService', function($http, $q, SessionService, LocationService) {
  var service = {
    create: function(roomname) {
      var defer = $q.defer();
      var username = SessionService.getUsername();
      var newRoomRef = roomsRef.child(roomname);
      newRoomRef.once('value', function(room) {
        if(room.val() === null) {
          newRoomRef.set({owner: username});
            newRoomRef.child('Users').child(username).set({active: true});
            usersRef
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
      var roomRef = roomsRef.child(roomname);
      var username = SessionService.getUsername();
      roomRef.once('value', function(room) {
        if(room.val() !== null) {
          SessionService.setCurrentRoom(roomname);
          roomRef.child('Users').child(username).set({active:true});
          currentRoomRef = roomRef;
          console.log('logged into room:', roomname);
          LocationService.getLocation()
          .then(
            function(position) {
              service.storePosition(position);
              LocationService.initializeMap(position);
              LocationService.startListeners();
            },
            function() {
              console.log('getLocation promise error');
            }
          );
        } else {
          console.log('room does not exist');
        }
      });
    },
    storePosition: function(position) {
      var currentRoom = SessionService.getCurrentRoom();
      var username = SessionService.getUsername();
      roomsRef
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
      usersRef
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