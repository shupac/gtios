angular.module('GetTogetherApp')
.controller('UserCtrl', function($scope, SessionService, MapService, PanService) {
  $scope.centerUser = function(username) {
    var user = $scope.users[username];
    var map = MapService.map;
    if(user.position) {
      var pos = new google.maps.LatLng(user.position.coords.latitude, user.position.coords.longitude);
      PanService.centerByPosition(pos, map);
    }
    $scope.toggleUsers();
  };

  $scope.$watch(function() {return SessionService.usersList;}, function(users) {
    $scope.users = users;
  });

});
