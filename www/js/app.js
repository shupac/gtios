var fbRef = new Firebase('https://gettogether.firebaseio.com');
var usersRef = fbRef.child('users');
var roomsRef = fbRef.child('rooms');
var currentRoomRef;

angular.module('GetTogetherApp', ['ngRoute', 'ngTouch', 'angular-gestures'])
.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    controller: 'MainCtrl',
    templateUrl: 'views/main.html'
  })
  .when('/signup', {
    controller: 'SignupCtrl',
    templateUrl: 'views/signup.html'
  })
  .when('/login', {
    controller: 'LoginCtrl',
    templateUrl: 'views/login.html'
  })
  .otherwise({
    redirectTo: '/'
  });
});