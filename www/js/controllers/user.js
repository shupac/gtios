angular.module('GetTogetherApp')
.controller('UserCtrl', function($scope, SessionService, MapService, PanService) {
  $scope.centerUser = function(username) {
    var user = users[username];
    var map = MapService.map;
    if(user.position) {
      PanService.centerByUser(user.position, map);
    }
  };

  $scope.$watch(function() {return SessionService.usersList;}, function(users) {
    $scope.users = users;
  });

});
