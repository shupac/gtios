angular.module('GetTogetherApp')
.controller('MainCtrl', function($scope, SessionService, MapService, RoomService, ChatService, SearchService, MarkerService, PanService){
  
  // prevent page scrolling
  document.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, false);

  $scope.chatSend = function() {
    ChatService.sendMessage($scope.chatMessage);
    $scope.chatMessage = "";
  };

  $scope.search = function() {
    console.log($scope.searchText);
    MapService.search($scope.searchText);
    $scope.searchText = "";
  };

  $scope.cancelSearch = function() {
    $scope.searchText = "";
    document.getElementById('autocomplete').blur();
  };

  $scope.cancelChat = function() {
    document.getElementById('sendChat').blur();
  };

  $scope.clearResults = function() {
    SearchService.clearMarkers();
  };

  $scope.toggleUpdate = function(room) {
    SessionService.syncUpdateType(room.name, room.update);
    MapService.storeCurrentPosition(room.name, room.update);

    // console.log(room.name, SessionService.currentRoom, room.update);
    if(room.name === SessionService.currentRoom && room.update === 'last') {
      RoomService.terminateRoomSession();
    }
  };

  $scope.centerUser = function(username) {
    var user = SessionService.usersList[username];
    var map = MapService.map;
    if(user.position) {
      PanService.centerByUser(user.position, map);
    }
  };

  // Getting session variables
  $scope.username = SessionService.sessionUsername;

  $scope.$watch(function() {return SessionService.usersList;}, function(users) {
    $scope.users = users;
  });

  $scope.$watch(function() {return ChatService.messages;}, function(messages) {
    $scope.messages = messages;
  });

  $scope.$watch(function() {return MarkerService.savedMarkers;}, function(markers) {
    $scope.markers = markers;
  });

  // If user is not in a room, show the room login panel
  if(SessionService.currentRoom === null) {
    $scope.roomsClass = 'center';
  }

});