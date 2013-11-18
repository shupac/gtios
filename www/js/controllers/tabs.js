angular.module('GetTogetherApp')
.controller('TabCtrl', function($scope, ChatService) {
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

  $scope.hideTabs = function() {
    $scope.showUsers = false;
    $scope.showPlaces = false;
  };
});
