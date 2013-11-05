angular.module('GetTogetherApp')
.run(function($rootScope, $location, SessionService) {
  $rootScope.$on("$routeChangeStart", function(evt, next, current) {
    if (!SessionService.isLoggedIn() && next.controller !== "SignupCtrl") {
      $location.path('/login');
    }
  });
})
.controller('LoginCtrl', function($scope, SessionService, $location){
  $scope.user = {
    username: 'Shu',
    password: 'test'
  };
  $scope.signedIn = SessionService.isLoggedIn();
  $scope.signup = function(username, password){
    SessionService.signup(username, password);
  };
  $scope.login = function(username, password){
    SessionService.login(username, password);
  };
  // $scope.login('Shu', 'test');
})
.controller('MainCtrl', function($scope, SessionService, LocationService, RoomService){
  $scope.showRooms = true;
  $scope.showChats = true;
  $scope.username = SessionService.getUsername();
  $scope.logout = function() {
    SessionService.logout();
    LocationService.logout();
  };
  // var map = 

  // getting initial location

  $scope.createRoom = function(roomname) {
    // debugger;
    RoomService.create(roomname)
    .then(
      function(roomname){
        SessionService.setCurrentRoom(roomname);
        currentRoomRef = roomsRef.child(roomname);
        LocationService.getLocation()
        .then(
          function(position) {
            RoomService.storePosition(position);
            LocationService.initializeMap(position);
            LocationService.startListeners();
          },
          function() {
            console.log('getLocation promise error');
          }
        );
      }, 
      function() {
        console.log('Roomname taken');
      }
    );
  }
});