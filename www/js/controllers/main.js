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
  $scope.login('hackreactor', 'test');
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

  $scope.session = SessionService;
  $scope.$watch('session.usersList', function(users) {
    $scope.users = users;
  });

  $scope.$watch('session.roomsList', function(rooms) {
    $scope.rooms = rooms;
  });

  $scope.createRoom = function(roomname) {
    RoomService.create(roomname)
    .then(
      function(roomname){
        $scope.joinRoom = {name: ""};
      }, 
      function() {
        console.log('Roomname taken');
      }
    );
  };

  $scope.join = function(roomname) {
    RoomService.joinRoom(roomname)
    .then(
      function() {
        $scope.roomsClass = 'hiddenLeft';
        $scope.joinRoom = {name: ""};
      }, function() {
        console.log('room does not exist');
      });
  };

  $scope.logout = function() {
    MapService.logout();
    SessionService.logout();
  };
});