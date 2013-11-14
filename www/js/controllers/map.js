angular.module('GetTogetherApp')
.controller('MapCtrl', function($scope, MapService, SearchService) {
  $scope.cancelSearch = function() {
    // SearchService.autcomplete();
  };

  $scope.clearResults = function() {
    SearchService.clearMarkers();
    SearchService.clearAutocomplete();
  };
});