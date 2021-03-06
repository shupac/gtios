// This service handles the map search functionality
// It places a marker on the map upon selecting a place from autocomplete list or
// places 10 markers from search results
angular.module('GetTogetherApp')
.factory('SearchService', function($q, MarkerService, PanService){
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
        service.clearAutocomplete();
      };

      google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);
    },

    // Generates info window with place information and option to save the place
    showInfoWindow: function() {
      var marker = this;
      service.places.getDetails({reference: marker.placeResult.reference},
        function(place, status) {
          if (status != google.maps.places.PlacesServiceStatus.OK) {
            return;
          }
          PanService.panInfoWindow(place, service.map);

          var contentString = 
            '<div id="info-window"><p>' + place.name + '</p><p>' + place.formatted_address.split(",")[0] + '</p>' + 
            '<img src="' + place.icon + '"/><hr>' +
            '<button id="save-marker">Save</button><button id="hide-marker">Hide</button></div>';

          if(service.infoWindow) {
            service.infoWindow.close();
            delete service.infoWindow;
          }
          
          service.infoWindow = new google.maps.InfoWindow({maxWidth: 150});
          service.infoWindow.setContent(contentString);
          service.infoWindow.open(service.map, marker);
          
          google.maps.event.addListener(service.infoWindow, 'domready', function() {
            document.getElementById('save-marker').addEventListener('click', function() {
              MarkerService.savePlace(place.reference, place.id, place.name)
              .then(function() {
                console.log('marker saved');
                marker.setMap(null);
                this.removeEventListener('click', arguments.callee, false);
              }, function() {
                console.log('error');
              });
            });
            document.getElementById('hide-marker').addEventListener('click', function() {
              marker.setMap(null);
              this.removeEventListener('click', arguments.callee, false);
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
    },
    clearAutocomplete: function() {
      var input = document.getElementById('autocomplete');
      input.blur();    
      setTimeout(function(){
        input.value = "";
        input.focus();
      },100);
    }
  }
  return service;
});