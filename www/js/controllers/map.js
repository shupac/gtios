angular.module('GetTogetherApp')
.controller('MapCtrl', function($scope, MapService, SearchService) {
  // prevent page scrolling
  document.getElementsByClassName('search-underlay')[0].addEventListener('touchmove', function(e) {
    document.activeElement.blur();
  }, false);

  $scope.displayPlace = function(prediction) {
    console.log(prediction);
    SearchService.displayPlace(prediction);
    $scope.cleanupSearch();
  };

  $scope.search = function(searchTerm) {
    console.log('search', searchTerm);
    SearchService.search(searchTerm);
    $scope.cleanupSearch();
  };

  $scope.cancelSearch = function() {
    $scope.cleanupSearch();
    if(!$scope.hasMarkers) {
      $scope.searchTerm = '';
    }
  };

  $scope.cleanupSearch = function() {
    $scope.searchFocus = false;
    $scope.input.blur();
  };

  $scope.hideAll = function() {
    SearchService.clearMarkers();
    $scope.searchTerm = '';
  };

  $scope.showCurrentPos = function() {
    MapService.showCurrentPosition();
  };

  $scope.$watch(function() {return SearchService.searchMarkers.length !== 0;}, function(hasMarkers) {
    $scope.hasMarkers = hasMarkers;
  });

  $scope.$watch('searchTerm', function(searchTerm) {
    if(MapService.map && searchTerm) {
      SearchService.getQueryPredictions(searchTerm);
    } else {
      $scope.predictions = [];
    }
  });

  $scope.$watch(function() {return SearchService.predictionResults;}, function(predictions) {
    $scope.predictions = predictions;
  });
});