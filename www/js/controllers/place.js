angular.module('GetTogetherApp')
.controller('PlaceCtrl', function($scope, MarkerService, MapService, PanService) {
  $scope.centerPlace = function(place) {
    console.log(place);
    var map = MapService.map;
    if(place.position) {
      PanService.centerByPosition(place.position, map);
    }
    $scope.togglePlaces();
  };

  $scope.$watch(function() {return MarkerService.savedMarkers;}, function(places) {
    $scope.places = places;
  });
});