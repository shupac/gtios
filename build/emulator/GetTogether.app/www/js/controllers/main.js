angular.module('GetTogetherApp')
.controller('MainCtrl', function($scope, SessionService, ChatService){
  // prevent page scrolling
  // document.addEventListener('touchmove', function(e) {
  //   e.preventDefault();
  // }, false);

  $scope.showUsers = false;

  $scope.toggleUsers = function() {
    $scope.showPlaces = false;
    $scope.showChat = false;
    $scope.showUsers = !$scope.showUsers;
  };

  $scope.togglePlaces = function() {
    $scope.showUsers = false;
    $scope.showChat = false;
    $scope.showPlaces = !$scope.showPlaces;
  };

  $scope.toggleChat = function() {
    $scope.showUsers = false;
    $scope.showPlaces = false;
    $scope.showChat = !$scope.showChat;
    ChatService.scrollToBottom();

  };

  $scope.panel = {};
  $scope.input = {
    blur: function() {
      document.activeElement.blur();
    }
  };

  $scope.username = SessionService.sessionUsername;
  
  // If user is not in a room, show the room login panel
  if(SessionService.currentRoom === null) {
    $scope.panel.hideRooms = false;
  }
});