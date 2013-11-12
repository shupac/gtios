angular.module('GetTogetherApp')
.factory('CenterService', function(){
  var service = {
    center: function(place, map) {
      map.setCenter(place.geometry.location);
      map.panBy(0, -120);
    }
  };
  return service;
});