angular.module('GetTogetherApp')
.controller('MapCtrl', function($scope, MapService, SearchService) {
  $scope.cancelSearch = function() {
    SearchService.clearAutocomplete();
  };

  $scope.clearResults = function() {
    SearchService.clearMarkers();
    SearchService.clearAutocomplete();
  };
});