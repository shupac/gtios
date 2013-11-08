angular.module('GetTogetherApp')
.factory('SearchService', function($q, $compile, $rootScope){
  var service = {
    locationMarkers: [],
    autocomplete: function(map) {
      var placesService = new google.maps.places.PlacesService(map);
      var input = document.getElementById('autocomplete');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo('bounds', map);

      var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';
      
      var markers = [];

      var resultsLimit = 10;

      var onPlaceChanged = function() {
        var place = autocomplete.getPlace();
        if (place.geometry) {
          var focusMarker = new google.maps.Marker({
            position: place.geometry.location,
            animation: google.maps.Animation.DROP
          });
          focusMarker.placeResult = place;
          focusMarker.setMap(map);
          google.maps.event.addListener(focusMarker, 'click', showInfoWindow);
          map.panTo(place.geometry.location);
          map.setZoom(15);
        } else {
          search();
        }
      };

      var dropMarker = function(i) {
        return function() {
          markers[i].setMap(map);
        };
      };

      var showInfoWindow = function() {
        var marker = this;
        service.currentMarker = this;
        placesService.getDetails({reference: marker.placeResult.reference},
          function(place, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
              return;
            }
            var contentString = 
              '<div id="info-window"><p>' + place.name + '</p><p>' + place.formatted_address.split(",")[0] + '</p>' + 
              '<div><button id="save-marker">Save</button></div>';
            var infoWindow = new google.maps.InfoWindow();
            
            infoWindow.open(map, marker);
            infoWindow.setContent(contentString);
            
            document.getElementById('save-marker').addEventListener('click', function() {
              service.locationMarkers.push(marker);
              console.log('marker saved');
            });
          });
      };

      var search = function() {
        var search = {
          bounds: map.getBounds()
        };

        placesService.search(search, function(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            clearMarkers();
            // Create a marker for each hotel found, and
            // assign a letter of the alphabetic to each marker icon.
            for (var i = 0; i < resultsLimit; i++) {
              // Use marker animation to drop the icons incrementally on the map.
              markers[i] = new google.maps.Marker({
                position: results[i].geometry.location,
                animation: google.maps.Animation.DROP
                // icon: markerIcon
              });
              // If the user clicks a hotel marker, show the details of that hotel
              // in an info window.
              markers[i].placeResult = results[i];
              google.maps.event.addListener(markers[i], 'click', showInfoWindow);
              setTimeout(dropMarker(i), i * 100);
            }
          }
        });
      };

      var clearMarkers = function() {
        for (var i = 0; i < markers.length; i++) {
          if (markers[i]) {
            markers[i].setMap(null);
          }
        }
        markers = [];
      };

      var buildIWContent = function(place) {
        console.log(place);
      };

      google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);
    }
  }
  return service;
});