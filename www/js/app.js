var refs = {};
refs.root = new Firebase('https://gettogether.firebaseio.com');
refs.users = refs.root.child('Users');
refs.rooms = refs.root.child('Rooms');

var onGoogleReady = function() {
  angular.bootstrap(document.getElementById("map-canvas"), ['GetTogetherApp.ui-map']);
};

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
})
.run(function($rootScope, $location, SessionService) {
  $rootScope.$on("$routeChangeStart", function(evt, next, current) {
    if (!SessionService.isLoggedIn() && next.controller !== "SignupCtrl") {
      $location.path('/login');
    }
  });
});