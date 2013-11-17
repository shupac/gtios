angular.module('GetTogetherApp')
.controller('MainCtrl', function($scope, SessionService, ChatService){
  // prevent page scrolling
  // document.addEventListener('touchmove', function(e) {
  //   e.preventDefault();
  // }, false);

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