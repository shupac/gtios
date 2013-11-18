angular.module('GetTogetherApp')
.factory('ChatService', function($q, SessionService, $timeout){
  var service = {
    initialize: function() {
      service.messages = [];
      var username = SessionService.sessionUsername;
      var roomname = SessionService.currentRoom;
      refs.rooms
        .child(roomname)
        .child('Messages')
        .on('child_added', function(message) {
          $timeout(function() {
            service.messages.push(message.val());
            if(message.val().username !== username) {
              service.newMessage = message.val();
            }
          });
          service.scrollToBottom();
        });
    },
    scrollToBottom: function() {
      var chatListEl = document.getElementsByClassName('chat-list')[0];
      setTimeout(function() {
        chatListEl.scrollTop = chatListEl.scrollHeight;
      }, 0);
    },
    sendMessage: function(message) {
      if(!message) {
        return;
      }
      var username = SessionService.sessionUsername;
      var roomname = SessionService.currentRoom;
      refs.rooms
        .child(roomname)
        .child('Messages')
        .push({username: username, message: message});
    },
    stopListener: function(roomname) {
      var username = SessionService.sessionUsername;
      refs.rooms
        .child(roomname)
        .child('Messages')
        .off();
      console.log('chat off');
    }
  };
  return service;
});