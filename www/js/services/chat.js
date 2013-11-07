angular.module('GetTogetherApp')
.factory('ChatService', function($q, SessionService, $rootScope){
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
        .on('child_added', function() {
          service.updateMessages();
        });
    },
    updateMessages: function() {
      var username = SessionService.sessionUsername;
      var roomname = SessionService.currentRoom;
      refs.rooms
        .child(roomname)
        .child('Messages')
        .once('value', function(messages) {
          $rootScope.$apply(service.messages = messages.val());
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