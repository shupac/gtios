angular.module('GetTogetherApp')
.factory('MarkerService', function($q, SessionService){
  var service = {
    savedMarkers: {},
    saveMarker: function(marker) {
      var defer = $q.defer();
      var roomname = SessionService.currentRoom;
      var username = SessionService.sessionUsername;
      var markersRef = refs.rooms.child(roomname).child('Markers');
      
      var newMarkerRef = markersRef.push();
      newMarkerRef.set({marker: JSON.stringify(marker.placeResult)}, function(error) {
        if(error) {
          defer.reject();
        } else {
          defer.resolve();
        }
      });
      service.savedMarkers[newMarkerRef.name()] = marker;
      console.log(service.savedMarkers);
      return defer.promise;
    }
  };
  return service;
});