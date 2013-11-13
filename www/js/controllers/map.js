angular.module('GetTogetherApp')
.controller('MapCtrl', function($scope, MapService, SearchService) {
  $scope.search = function() {
    console.log($scope.searchText);
    MapService.search($scope.searchText);
    $scope.searchText = "";
  };

  $scope.cancelSearch = function() {
    $scope.searchText = "";
    document.getElementById('autocomplete').blur();
  };

  $scope.clearResults = function() {
    SearchService.clearMarkers();
  };
});