angular.module('GetTogetherApp')
.factory('MapService', function($http, $q, SessionService){
  var service = {
    markers: {},
    initializeMap: function(roomname) {
      service.markers = {};
      navigator.geolocation.clearWatch(service.watchID);
      var mapOptions = {
        zoom: 13,
        zoomControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      service.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      service.getLocation()
      .then(function(position) {
        service.displayMap(position);
        service.storePosition(position);
        service.autocomplete();
        // service.watchPosition();
      })
      .then(function() {
        service.startListeners(roomname);
      });
    },
    getLocation: function() {
      var defer = $q.defer();
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(position) {
            position.coords.heading = position.coords.heading || 0;
            // service.currentPosition = position;
            defer.resolve(position);
          },
          function(){
            console.log('getCurrentPosition error')
          }, {'enableHighAccuracy':true,'timeout':10000,'maximumAge':0}
        );
      } else {
        console.log("Browser doesn't support Geolocation");
      }
      return defer.promise;
    },
    watchPosition: function() {
      // console.log('watchPosition started');
      service.watchID = navigator.geolocation.watchPosition(
        function(position) {
          position.coords.heading = position.coords.heading || 0;
          // service.currentPosition = position;
          var rooms = SessionService.roomsList;
          for(var i = 0; i < rooms.length; i++) {
            service.storePosition(position, rooms[i]);
          }
        },
        function(){
          console.log('watchPosition error')
        },{'enableHighAccuracy':true,'timeout':10000,'maximumAge':0}
      );
    },
    displayMap: function(position) {
      var username = SessionService.getUsername();
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      service.map.setCenter(pos);
    },
    displayMarker: function(position, username) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      var marker = new google.maps.Marker({
        position: pos,
        title: username
      });

      var infowindow = new google.maps.InfoWindow({
        content: marker.title
      });

      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(service.map,marker);
      });
      return marker;
    },

    autocomplete: function(text) {
      var map = service.map;
      var places = new google.maps.places.PlacesService(map);
      var input = document.getElementById('autocomplete');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo('bounds', map);

      var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';
      var infoWindow = new google.maps.InfoWindow();
      
      var markers = [];

      var dropMarker = function(i) {
        return function() {
          markers[i].setMap(map);
        };
      }

      var showInfoWindow = function() {
        var marker = this;
        places.getDetails({reference: marker.placeResult.reference},
            function(place, status) {
              if (status != google.maps.places.PlacesServiceStatus.OK) {
                return;
              }
              infoWindow.open(map, marker);
              buildIWContent(place);
            });
      }

      var onPlaceChanged = function() {
        var place = autocomplete.getPlace();
        if (place.geometry) {
          new google.maps.Marker({
            position: place.geometry.location
          }).setMap(map);
          map.panTo(place.geometry.location);
          map.setZoom(15);
        } else {
          search();
        }
      };

      var search = function() {
        var search = {
          bounds: map.getBounds()
        };

        places.search(search, function(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            clearMarkers();
            // Create a marker for each hotel found, and
            // assign a letter of the alphabetic to each marker icon.
            for (var i = 0; i < results.length; i++) {
              var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
              var markerIcon = MARKER_PATH + markerLetter + '.png';
              // Use marker animation to drop the icons incrementally on the map.
              markers[i] = new google.maps.Marker({
                position: results[i].geometry.location,
                animation: google.maps.Animation.DROP,
                icon: markerIcon
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
    },

    storePosition: function(position, roomname) {
      roomname = roomname || SessionService.currentRoom;
      var defer = $q.defer();
      var username = SessionService.getUsername();
      var sessionUserRef = refs.rooms
        .child(roomname)
        .child('Users')
        .child(username);

      sessionUserRef
        .set({
          position: {coords: position.coords, timestamp: position.timestamp},
          active: true
        },
        function(error) {
          if (error) {
            console.log('position could not be saved.' + error);
          } else {
            // console.log('position saved successfully in', roomname);
            defer.resolve();
          }
        });
      return defer.promise;
    },

    stopListeners: function(roomname) {
      refs.rooms.child(roomname).child('Users').off();
    },

    startListeners: function(roomname) {
      // console.log('start listener', roomname);
      sessionUsersInRoomRef = refs.rooms.child(roomname).child('Users');
      sessionUsersInRoomRef.on('child_added', function(user) {
        var username = user.name();
        console.log('Marker added:', username, 'added to', roomname);
        sessionUsersInRoomRef
          .child(username)
          .child('position')
          .once('value', function(position) {
            if(position.val() !== null) {
              var marker = service.displayMarker(position.val(), username);
              service.markers[username] = marker;
              marker.setMap(service.map);
              SessionService.updateUsersList();
            }
          });
      });

      sessionUsersInRoomRef.on('child_changed', function(user) {
        // console.log(user.val());
        var username = user.name();
        sessionUsersInRoomRef
          .child(username)
          .child('position')
          .once('value', function(position) {
            if(position.val() === null) {
              if(service.markers[username]) {
                console.log('Marker removed:', username, 'removed from', roomname);
                SessionService.updateUsersList();
                service.markers[username].setMap(null);
              }
              delete service.markers[username];
            } else {
              var pos = new google.maps.LatLng(position.val().coords.latitude, position.val().coords.longitude);
              if(service.markers[username]) {
                service.markers[username].setPosition(pos);
                console.log('Marker updated: ', username, 'in', roomname);
              } else {
                var marker = service.displayMarker(position.val(), username);
                service.markers[username] = marker;
                marker.setMap(service.map);
                SessionService.updateUsersList();
              }
            }
          });
      });

      // user leaves room
      sessionUsersInRoomRef.on('child_removed', function(user) {
        var username = user.name();
        console.log('Marker removed:', username, 'removed from', roomname);
        service.markers[username].setMap(null);
        SessionService.updateUsersList();
        delete service.markers[username];
      });
    },
    logout: function() {
      console.log('clearWatch', service.watchID);
      navigator.geolocation.clearWatch(service.watchID);
      service.stopListeners(SessionService.currentRoom);
      var username = SessionService.getUsername();
      var rooms = SessionService.roomsList;
      for(var i = 0; i < rooms.length; i++) {
        console.log(rooms[i]);

        var sessionUserRef = refs.rooms
          .child(rooms[i])
          .child('Users')
          .child(username);

        sessionUserRef
          .set({
            active: false
          });
        //   .child('active')
        //   .set({active: false});
        // sessionUserRef
        //   .child('position')
        //   .remove();
      }
    },
    terminateMap: function(roomname) {
      service.stopListeners(roomname);
      service.map = null;
      document.getElementById('map-canvas').innerHTML = "";
    }
  };
  return service;
});