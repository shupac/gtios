angular.module('GetTogetherApp')
.factory('PanService', function(){
  var service = {
    panInfoWindow: function(place, map) {
      map.setCenter(place.geometry.location);
      map.panBy(0, -140); // pans map down by -120px
    },

    centerByPosition: function(position, map) {
      // var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map.setCenter(position);
      map.setZoom(16);
    }
  };
  return service;
});