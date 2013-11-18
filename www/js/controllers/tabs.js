angular.module('GetTogetherApp')
.controller('TabCtrl', function($scope, SessionService, ChatService) {
  $scope.username = SessionService.sessionUsername;
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
    $scope.newMessage = null;
    ChatService.scrollToBottom();
  };

  $scope.hideTabs = function() {
    $scope.showUsers = false;
    $scope.showPlaces = false;
  };

  $scope.$watch(function() {return ChatService.newMessage;}, function(newMessage) {
    $scope.newMessage = newMessage;
    if($scope.timeout) {
      clearTimeout($scope.timeout);
    }
    $scope.timeout = setTimeout(function() {
      $scope.newMessage = null;
    }, 5000);
  });
});
