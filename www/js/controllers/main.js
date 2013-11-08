angular.module('GetTogetherApp')
.run(function($rootScope, $location, SessionService) {
  $rootScope.$on("$routeChangeStart", function(evt, next, current) {
    if (!SessionService.isLoggedIn() && next.controller !== "SignupCtrl") {
      $location.path('/login');
    }
  });
})
.controller('LoginCtrl', function($scope, SessionService, $location){
  $scope.userLogin = {
    username: 'Shu',
    password: 'test'
  };
  $scope.signedIn = SessionService.isLoggedIn();
  $scope.signup = function(username, password){
    SessionService.signup(username.toLowerCase(), password);
  };
  $scope.login = function(username, password){
    SessionService.login(username.toLowerCase(), password);
  };
  $scope.login('hackreactor', 'test');
})
.controller('MainCtrl', function($scope, SessionService, MapService, RoomService, ChatService){
  document.addEventListener('touchmove', function(e) {
    // Cancel the event
    e.preventDefault();
  }, false);

  $scope.createRoom = function(roomname) {
    roomname = roomname.toLowerCase();
    RoomService.create(roomname)
    .then(
      function(roomname){
        // ChatService.startListener();
        $scope.roomsClass = 'hiddenLeft';
        $scope.joinRoom = {name: ""};
      }, 
      function() {
        console.log('Roomname taken');
      }
    );
  };

  $scope.join = function(roomname) {
    roomname = roomname.toLowerCase();
    RoomService.joinRoom(roomname)
    .then(
      function() {
        ChatService.startListener();
        $scope.roomsClass = 'hiddenLeft';
        $scope.joinRoom = {name: ""};
      }, function() {
        console.log('room does not exist');
      });
  };

  $scope.leaveRoom = function(roomname) {
    RoomService.leaveRoom(roomname)
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
    document.getElementById('autocomplete').blur();
  }

  $scope.cancelChat = function() {
    document.getElementById('sendChat').blur();
  }

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

  // If user is not in a room, show the room login panel
  if(SessionService.currentRoom === null) {
    $scope.roomsClass = 'center';
  }

  $scope.join('public');

  // $scope.watch(function() {return SearchService.locationMarkers;}, function(locationMarkers) {
  //   $scope.myMarkers = locationMarkers;
  // });


  //   $scope.openMarkerInfo = function (marker) {
  //     $scope.currentMarker = marker;
  //     $scope.currentMarkerLat = marker.getPosition().lat();
  //     $scope.currentMarkerLng = marker.getPosition().lng();
  //     $scope.myInfoWindow.open($scope.myMap, marker);
  //   };


});
// .directive('infoWindow', function() {
//   return {
//     restrict 'A',
//     template: '<p>{{ name }}</p>' +
//     '<p>{{ address }}</p>' +
//     '<button id="saveMarker" ng-click="saveCurrentMarker()">Save</button>',
//     scope: {
//       myMarker: '='
//     },
//     link: function (scope, element, attrs) {

//     }
//   }
// });