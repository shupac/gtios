angular.module('GetTogetherApp')
.controller('MapCtrl', function($scope, MapService, SearchService) {
  $scope.cancelSearch = function() {
    $scope.searchText = '';
    $scope.searchFocus = false;
  };

  $scope.clearResults = function() {
    SearchService.clearMarkers();
    SearchService.clearAutocomplete();
  };

  $scope.$watch(function() {return SearchService.searchMarkers.length !== 0;}, function(hasMarkers) {
    $scope.hasMarkers = hasMarkers;
  });
});