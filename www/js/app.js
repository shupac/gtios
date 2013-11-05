var refs = {};
refs.root = new Firebase('https://gettogether.firebaseio.com');
refs.users = refs.root.child('Users');
refs.rooms = refs.root.child('Rooms');
refs.currentRoom = null;

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