angular.module('GetTogetherApp')
.factory('SearchService', function($q, MarkerService){
  var service = {
    searchMarkers: [],
    autocomplete: function(map) {
      service.map = map;
      service.places = new google.maps.places.PlacesService(map);
      var input = document.getElementById('autocomplete');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo('bounds', map);

      var onPlaceChanged = function() {
        service.clearMarkers();
        var place = autocomplete.getPlace();
        if (place.geometry) {
          var focusMarker = new google.maps.Marker({
            position: place.geometry.location,
            animation: google.maps.Animation.DROP
          });
          focusMarker.placeResult = place;
          service.searchMarkers.push(focusMarker);
          focusMarker.setMap(map);
          google.maps.event.addListener(focusMarker, 'click', service.showInfoWindow);
          map.panTo(place.geometry.location);
          map.setZoom(15);
        } else {
          service.search();
        }
        document.getElementById('autocomplete').value = "";
      };

      google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);
    },
    showInfoWindow: function() {
      var marker = this;
      service.currentMarker = this;
      service.places.getDetails({reference: marker.placeResult.reference},
        function(place, status) {
          if (status != google.maps.places.PlacesServiceStatus.OK) {
            return;
          }
          var contentString = 
            '<div id="info-window"><p>' + place.name + '</p><p>' + place.formatted_address.split(",")[0] + '</p>' + 
            '<button id="save-marker">Save</button><button id="hide-marker">Hide</button></div>';
          var infoWindow = new google.maps.InfoWindow({
            content: contentString
          });
          
          infoWindow.open(service.map, marker);
          // infoWindow.setContent(contentString);
          
          google.maps.event.addListener(infoWindow, 'domready', function() {
            document.getElementById('save-marker').addEventListener('click', function() {
              MarkerService.saveMarker(marker)
              .then(function() {
                console.log('marker saved');
                marker.setMap(null);
              }, function() {
                console.log('error');
              });
            });
            document.getElementById('hide-marker').addEventListener('click', function() {
              marker.setMap(null);
            });
          });
        });
    },
    clearMarkers: function() {
      for (var i = 0; i < service.searchMarkers.length; i++) {
        if (service.searchMarkers[i]) {
          service.searchMarkers[i].setMap(null);
        }
      }
      service.searchMarkers = [];
    },
    search: function() {
      var resultsLimit = 10;
      var searchTerm = document.getElementById('autocomplete').value;
      // var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';

      var dropMarker = function(i) {
        return function() {
          service.searchMarkers[i].setMap(service.map);
        };
      };

      var query = {
        bounds: service.map.getBounds(),
        keyword: searchTerm
      };

      service.places.radarSearch(query, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < resultsLimit; i++) {
            service.searchMarkers[i] = new google.maps.Marker({
              position: results[i].geometry.location,
              animation: google.maps.Animation.DROP
            });
            service.searchMarkers[i].placeResult = results[i];
            google.maps.event.addListener(service.searchMarkers[i], 'click', service.showInfoWindow);
            setTimeout(dropMarker(i), i * 100);
          }
        }
      });
    }
  }
  return service;
});