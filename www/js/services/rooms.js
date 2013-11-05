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
            newRoomRef.child('users').child(username).set({active: true});
            usersRef.child(username).child('rooms').push({roomname: roomname});
            defer.resolve(roomname);
            console.log(roomname, 'created');
        } else {
          defer.reject();
        }
      });
      return defer.promise;
    },
    storePosition: function(position) {
      var currentRoom = SessionService.getCurrentRoom();
      var username = SessionService.getUsername();
      roomsRef
        .child(currentRoom)
        .child(username)
        .child('position')
        .set({coords: position.coords, timestamp: position.timestamp});
    }
  };
  return service;
});