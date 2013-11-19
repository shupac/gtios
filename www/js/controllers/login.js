angular.module('GetTogetherApp')
.controller('LoginCtrl', function($scope, SessionService){
  // $scope.userLogin = {
  //   username: 'shu',
  //   password: 'test'
  // };
  $scope.signedIn = SessionService.isLoggedIn();
  $scope.signup = function(username, password){
    SessionService.signup(username.toLowerCase(), password);
  };
  $scope.login = function(username, password){
    SessionService.login(username.toLowerCase(), password);
  };
  // $scope.login('hackreactor', 'test');
  // $scope.login('shu', 'test');
});
