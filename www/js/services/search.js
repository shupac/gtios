// This service handles the map search functionality
// It places a marker on the map upon selecting a place from autocomplete list or
// places 10 markers from search results
angular.module('GetTogetherApp')
.factory('SearchService', function($q, $timeout, MarkerService, PanService){
  var service = {
    predictionResults: [],
    searchMarkers: [],
    icon: {
      url: 'img/map/reddot-12x12.png',
      size: new google.maps.Size(12, 12),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(6, 6)
    },
    initAutocomplete: function(map) {
      service.map = map;
      service.places = new google.maps.places.PlacesService(map);
      service.predictions = new google.maps.places.AutocompleteService();
    },
    getQueryPredictions: function(searchTerm) {
      var callback = function(predictionResults) {
        service.predictionResults = [];
        for(var i = 0; i < predictionResults.length; i++) {
          var prediction = predictionResults[i];
          var str = prediction.description;
          var matchedIndex = prediction.matched_substrings[0].offset;
          var matchedLength = prediction.matched_substrings[0].length;
          var splitStr = str.split(',');
          
          var name = splitStr.shift();
          var namePre = name.substring(0, matchedIndex);
          var nameMatched = name.substring(matchedIndex, matchedIndex + matchedLength);
          var namePost = name.substring(matchedIndex + matchedLength);
          splitStr.pop();
          var address = splitStr.join(',');
          service.predictionResults.push({
            namePre: namePre,
            nameMatched: nameMatched,
            namePost: namePost,
            address: address,
            reference: prediction.reference
          });
        }
        $timeout(function() {
          // service.predictionResults = predictionResults;
        });
      };
      service.predictions.getQueryPredictions({
        input: searchTerm,
        bounds: service.map.getBounds()
      }, callback);
    },
    displayPlace: function(prediction) {
      var defer = $q.defer();
      if(prediction.reference) {
        defer.resolve();
        service.places.getDetails({reference: prediction.reference},
          function(place, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
              return;
            }
            service.clearMarkers();
            var map = service.map;
            var focusMarker = new google.maps.Marker({
              position: place.geometry.location,
              icon: service.icon,
              animation: google.maps.Animation.DROP
            });
            focusMarker.placeResult = place;
            service.searchMarkers.push(focusMarker);
            $timeout(function() {});
            focusMarker.setMap(service.map);
            google.maps.event.addListener(focusMarker, 'click', service.showInfoWindow);
            map.panTo(place.geometry.location);
            map.setZoom(15);
        });
      } else {
        defer.reject();
        service.search(prediction);
      }
      return defer.promise;
    },
    search: function(searchTerm) {
      var resultsLimit = 10;
      // var searchTerm = document.getElementById('autocomplete').value;
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
              icon: service.icon,
              animation: google.maps.Animation.DROP
            });
            service.searchMarkers[i].placeResult = results[i];
            $timeout(function(){});
            google.maps.event.addListener(service.searchMarkers[i], 'click', service.showInfoWindow);
            setTimeout(dropMarker(i), i * 100);
          }
        }
      });
    },

    // Generates info window with place information and option to save the place
    showInfoWindow: function() {
      var marker = this;
      service.places.getDetails({reference: marker.placeResult.reference},
        function(place, status) {
          if (status != google.maps.places.PlacesServiceStatus.OK) {
            return;
          }
          service.setContentWindow(place, marker);
        });
    },

    setContentWindow: function(place, marker) {
      PanService.panInfoWindow(place, service.map);

      if(place.photos) {
        console.log('photos', place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 120}));
      }

      var contentString = 
        '<div id="info-window"><p>' + place.name + '</p><p>' + place.formatted_address.split(",")[0] + '</p>' + 
        '<img src="' + place.icon + '"/><hr>' +
        '<div><button id="save-marker">Save</button><button id="hide-marker">Hide</button></div></div>';

      if(service.infoWindow) {
        service.infoWindow.close();
        delete service.infoWindow;
      }
      
      service.infoWindow = new google.maps.InfoWindow({maxWidth: 180});
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
    },

    clearMarkers: function() {
      for (var i = 0; i < service.searchMarkers.length; i++) {
        if (service.searchMarkers[i]) {
          service.searchMarkers[i].setMap(null);
        }
      }
      service.searchMarkers = [];
    }
  }
  return service;
});