angular.module('GetTogetherApp')
.run(function($rootScope, $location, SessionService) {
  $rootScope.$on("$routeChangeStart", function(evt, next, current) {
    if (!SessionService.isLoggedIn() && next.controller !== "SignupCtrl") {
      $location.path('/login');
    }
  });
})
.controller('LoginCtrl', function($scope, SessionService, $location){
  // $scope.user = {
  //   username: 'Shu',
  //   password: 'test'
  // };
  $scope.signedIn = SessionService.isLoggedIn();
  $scope.signup = function(username, password){
    SessionService.signup(username, password);
  };
  $scope.login = function(username, password){
    SessionService.login(username, password);
  };
  // $scope.login('Shu', 'test');
})
.controller('MainCtrl', function($scope, SessionService, MapService, RoomService){
  document.addEventListener('touchmove', function(e) {
    // Cancel the event
    e.preventDefault();
  }, false);
  $scope.currentRoom = SessionService.getCurrentRoom;
  $scope.showRooms = true;
  $scope.showChats = true;
  $scope.username = SessionService.getUsername();

  if(SessionService.currentRoom === null) {
    $scope.roomsClass = 'center';
  }

  SessionService.getRooms()
  .then(function(rooms) {
    $scope.rooms = rooms;
  });

  $scope.$watch(function() {return SessionService.currentUsers;}, function(users) {
    $scope.users = users;
  });

  $scope.createRoom = function(roomname) {
    RoomService.create(roomname)
    .then(
      function(roomname){
        $scope.rooms.push(roomname);
        SessionService.currentRoom = roomname;
        $scope.joinRoom = {name: ""};
      
        SessionService.getUsers();
      }, 
      function() {
        console.log('Roomname taken');
      }
    );
  };

  $scope.join = function(roomname) {
    RoomService.joinRoom(roomname)
    .then(function() {
      MapService.stopListeners(SessionService.currentRoom);
      SessionService.currentRoom = roomname;
      if($scope.rooms.indexOf(roomname) === -1) {
        $scope.rooms.push(roomname);
      }
      $scope.roomsClass = 'hiddenLeft';
      $scope.joinRoom = {name: ""};

      SessionService.getUsers();
    }, function() {
      console.log('room does not exist');
    });
  };

  $scope.logout = function() {
    MapService.logout();
    SessionService.logout();
  };
});