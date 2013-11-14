angular.module('GetTogetherApp')
.controller('RoomCtrl', function($scope, SessionService, MapService, RoomService){
  $scope.createRoom = function(roomname) {
    roomname = roomname.toLowerCase();
    RoomService.create(roomname)
    .then(
      function(roomname){
        $scope.panel.hideRooms = true;
      }, 
      function() {
        navigator.notification.alert(
          "The group '" + roomname + "' has already been taken. Please choose a different group name",
          $scope.joinRoom
        );
      }
    );
  };

  $scope.joinRoom = function(roomname) {
    roomname = roomname.toLowerCase();
    RoomService.joinRoom(roomname)
    .then(
      function() {
        $scope.panel.hideRooms = true;
      }, 
      function() {
        navigator.notification.alert(
          "The group '" + roomname + "' does not exist. Please select a different group",
          null
        );
      }
    );
  };

  // navigator.notification is defined by phonegap plugin
  // and provides popups for prompt and confirmation dialog boxes
  $scope.join = function() {
    navigator.notification.prompt(
      'Enter the group name',
      function(result) {
        if(result.buttonIndex === 1) {
          $scope.joinRoom(result.input1);
        }
      },
      'Join Group',
      ['Join','Cancel'],
      'public'
    );
  };

  $scope.create = function() {
    navigator.notification.prompt(
      'Enter the group name',
      function(result) {
        if(result.buttonIndex === 1) {
          $scope.createRoom(result.input1);
        }
      },
      'Create Group',
      ['Create','Cancel'],
      'new'
    );
  };

  // toggles 'live' vs 'last' update type
  // updates user's current position in Firebase
  $scope.toggleUpdate = function(room) {
    SessionService.syncUpdateType(room.name, room.update);
    MapService.storeCurrentPosition(room.name, room.update);

    // if toggling from 'live' to 'last' in current room, logs user out of current room
    if(room.name === SessionService.currentRoom && room.update === 'last') {
      RoomService.terminateRoomSession();
    }
  };

  $scope.deleteRoom = function(roomname) {
    RoomService.deleteRoom(roomname)
    .then(function() {
      console.log('left room');
    });
  }

  $scope.logout = function() {
    MapService.logout();
    SessionService.logout();
  };

  // udpates list of rooms user belongs to
  $scope.$watch(function() {return SessionService.roomsList;}, function(rooms) {
    $scope.rooms = rooms;
  });

  $scope.$watch(function() {return SessionService.currentRoom;}, function(currentRoom) {
    $scope.currentRoom = currentRoom;
  });

  var joinRoom = 'public';
  
  if(window.openParams) {
    joinRoom = openParams.roomInvite;
  }

  // $scope.joinRoom(joinRoom);

});