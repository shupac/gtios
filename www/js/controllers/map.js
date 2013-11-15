angular.module('GetTogetherApp')
.controller('MapCtrl', function($scope, MapService, SearchService) {
  // prevent page scrolling
  document.getElementsByClassName('search-underlay')[0].addEventListener('touchmove', function(e) {
    document.activeElement.blur();
  }, false); 
  
  $scope.clearSearchText = function() {
    SearchService.clearAutocomplete();
  };

  $scope.cancelSearch = function() {
    $scope.searchFocus = false;
    $scope.input.blur();
    // setTimeout(function() {
    // });
    if(!$scope.hasMarkers) {
    // SearchService.clearAutocomplete();
      $scope.searchText = '';
    }
  };

  $scope.clearResults = function() {
    SearchService.clearMarkers();
    SearchService.clearAutocomplete();
  };

  $scope.$watch(function() {return SearchService.searchMarkers.length !== 0;}, function(hasMarkers) {
    $scope.hasMarkers = hasMarkers;
  });
});