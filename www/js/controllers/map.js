angular.module('GetTogetherApp')
.controller('MapCtrl', function($scope, $rootScope, SessionService, MapService, SearchService, ChatService) {
  // prevent page scrolling
  document.getElementsByClassName('search-underlay')[0].addEventListener('touchmove', function(e) {
    document.activeElement.blur();
  }, false);

  $scope.displayPlace = function(prediction) {
    SearchService.displayPlace(prediction);
    $scope.cleanupSearch();
  };

  $scope.focusSearch = function() {
    document.getElementById('autocomplete').focus();
    $scope.searchFocus = true;
  };

  $scope.search = function(searchTerm) {
    SearchService.clearMarkers();
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

  $scope.$watch(function() {return SessionService.invitesList;}, function(invites) {
    if(invites === {}) {
      $scope.invites = false;
    } else {
      $scope.invites = true;
    }
  });

});