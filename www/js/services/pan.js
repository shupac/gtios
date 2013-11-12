angular.module('GetTogetherApp')
.factory('PanService', function(){
  var service = {
    panInfoWindow: function(place, map) {
      map.setCenter(place.geometry.location);
      map.panBy(0, -120); // pans map down by -120px
    }
  };
  return service;
});