angular.module('GetTogetherApp')
.run(function($rootScope, $location, SessionService) {
  $rootScope.$on("$routeChangeStart", function(evt, next, current) {
    if (!SessionService.isLoggedIn() && next.controller !== "SignupCtrl") {
      $location.path('/login');
    }
  });
})
.controller('LoginCtrl', function($scope, SessionService, $location){
  // $scope.userLogin = {
  //   username: 'Shu',
  //   password: 'test'
  // };
  $scope.signedIn = SessionService.isLoggedIn();
  $scope.signup = function(username, password){
    SessionService.signup(username.toLowerCase(), password);
  };
  $scope.login = function(username, password){
    SessionService.login(username.toLowerCase(), password);
  };
  $scope.login('hackreactor', 'test');
  // $scope.login('shu', 'test');
})
.controller('MainCtrl', function($scope, SessionService, MapService, RoomService, ChatService, SearchService, MarkerService, PanService){
  
  // prevent page scrolling
  document.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, false);

  $scope.createRoom = function(roomname) {
    roomname = roomname.toLowerCase();
    RoomService.create(roomname)
    .then(
      function(roomname){
        $scope.roomsClass = 'hiddenLeft';
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
        $scope.roomsClass = 'hiddenLeft';
      }, 
      function() {
        navigator.notification.alert(
          "The group '" + roomname + "' does not exist. Please select a different group",
          null
        );
      }
    );
  };

  $scope.join = function() {
    // navigator.notification.prompt(
    //   'Enter the group name',
    //   function(result) {
    //     if(result.buttonIndex === 1) {
    //       $scope.joinRoom(result.input1);
    //     }
    //   },
    //   'Join Group',
    //   ['Join','Cancel'],
    //   'public'
    // );
  };

  $scope.create = function() {
    // navigator.notification.prompt(
    //   'Enter the group name',
    //   function(result) {
    //     if(result.buttonIndex === 1) {
    //       $scope.createRoom(result.input1);
    //     }
    //   },
    //   'Create Group',
    //   ['Create','Cancel'],
    //   'new'
    // );
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

  $scope.$watch(function() {return SessionService.currentRoom;}, function(currentRoom) {
    $scope.currentRoom = currentRoom;
  })

  $scope.$watch(function() {return SessionService.usersList;}, function(users) {
    $scope.users = users;
  });

  $scope.$watch(function() {return SessionService.roomsList;}, function(rooms) {
    $scope.rooms = rooms;
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

  var joinRoom = 'public';
  
  if(window.openParams) {
    joinRoom = openParams.roomInvite;
  }

  $scope.join(joinRoom);

});