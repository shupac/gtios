angular.module('GetTogetherApp')
.factory('PanService', function(){
  var service = {
    panInfoWindow: function(place, map) {
      map.setCenter(place.geometry.location);
      map.panBy(0, -120); // pans map down by -120px
    },

    centerByUser: function(position, map) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map.setCenter(pos);
      map.setZoom(17);
    }
  };
  return service;
});