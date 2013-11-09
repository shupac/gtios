angular.module('GetTogetherApp')
.factory('MarkerService', function($q, SessionService, $rootScope, $timeout){
  var service = {
    savedMarkers: {},
    savePlace: function(reference, id) {
      var defer = $q.defer();
      var roomname = SessionService.currentRoom;
      var username = SessionService.sessionUsername;
      var markersRef = refs.rooms.child(roomname).child('Places');
      if(savedMarkers[id]) {
        console.log('location already saved');
        defer.reject();
      } else {
        markersRef.child(id).set({reference: reference}, function(error) {
          if(error) {
            defer.reject();
          } else {
            defer.resolve();
          }
        });
      }
      return defer.promise;
    },
    startListeners: function(map) {
      service.map = map;
      service.places = new google.maps.places.PlacesService(map);

      // Change to storing place reference
      // Retrieve by place reference

      var roomname = SessionService.currentRoom;
      var username = SessionService.sessionUsername;
      var markersRef = refs.rooms.child(roomname).child('Places');

      markersRef.on('child_added', function(data) {
        var placeId = data.name();
        reference = data.val().reference;

        service.places.getDetails({reference: reference},
          function(place, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
              return;
            } else {
              var marker = new google.maps.Marker({
                position: place.geometry.location,
                icon: 'img/map/reddot.png',
                zIndex: 1
              });
              marker.placeResult = place;
              $timeout(function() {
                service.savedMarkers[placeId] = marker;
              });
              marker.setMap(map);
              google.maps.event.addListener(marker, 'click', service.showInfoWindow);
            }
          });
      });

    },

    stopListeners: function() {
      var roomname = SessionService.currentRoom;
      var markersRef = refs.rooms.child(roomname).child('Places');
      markersRef.off();
      $timeout(function() {
        service.savedMarkers = {};
      });
    },

    showInfoWindow: function() {
      var marker = this;
      var place = marker.placeResult;
      var contentString = 
        '<div id="info-window"><p>' + place.name + '</p><p>' + place.formatted_address.split(",")[0] + '</p>' + 
        '<button id="edit-marker">Edit</button><button id="delete-marker">Delete</button></div>';
      var infoWindow = new google.maps.InfoWindow({
        content: contentString
      });
      
      infoWindow.open(service.map, marker);
      // infoWindow.setContent(contentString);
      
      google.maps.event.addListener(infoWindow, 'domready', function() {
        document.getElementById('edit-marker').addEventListener('click', function() {
          console.log('edit marker');
        });
        document.getElementById('delete-marker').addEventListener('click', function() {
          // marker.setMap(null);
          console.log('delete marker');
        });
      });
    },
  };
  return service;
});