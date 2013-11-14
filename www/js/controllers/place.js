angular.module('GetTogetherApp')
.controller('PlaceCtrl', function($scope, MarkerService, PanService) {

  $scope.$watch(function() {return MarkerService.savedMarkers;}, function(places) {
    $scope.places = places;
  });
});