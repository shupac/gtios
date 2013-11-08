angular.module('GetTogetherApp')
.factory('ChatService', function($q, SessionService, $timeout){
  var service = {
    messages: [],
    sendMessage: function(message) {
      var username = SessionService.sessionUsername;
      var roomname = SessionService.currentRoom;
      refs.rooms
        .child(roomname)
        .child('Messages')
        .push({username: username, message: message});
    },
    startListener: function() {
      var username = SessionService.sessionUsername;
      var roomname = SessionService.currentRoom;
      refs.rooms
        .child(roomname)
        .child('Messages')
        .on('child_added', function(message) {
          $timeout(function() {
            service.messages.push(message.val());
          });
        });
    },
    stopListener: function(roomname) {
      var username = SessionService.sessionUsername;
      refs.rooms
        .child(roomname)
        .child('Messages')
        .off();
    }
  };
  return service;
});