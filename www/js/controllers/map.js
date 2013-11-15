angular.module('GetTogetherApp')
.controller('MapCtrl', function($scope, MapService, SearchService) {
  $scope.cancelSearch = function() {
    $scope.searchText = '';
  };

  $scope.clearResults = function() {
    SearchService.clearMarkers();
    SearchService.clearAutocomplete();
  };
});