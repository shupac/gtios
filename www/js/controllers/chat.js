angular.module('GetTogetherApp')
.controller('ChatCtrl', function($scope, SessionService, ChatService){

  $scope.chatSend = function() {
    ChatService.sendMessage($scope.chatMessage);
    $scope.chatMessage = "";
  };

  $scope.cancelChat = function() {
    document.getElementById('sendChat').blur();
  };

  $scope.$watch(function() {return ChatService.messages;}, function(messages) {
    $scope.messages = messages;
  });

});