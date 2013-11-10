angular.module('GetTogetherApp')
.factory('MapService', function($http, $q, SessionService, $filter, SearchService, MarkerService){
  var service = {
    userMarkers: {},
    initializeMap: function(roomname) {
      service.userMarkers = {};
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
        service.currentPosition = position;
        service.storeCurrentPosition();
        SearchService.autocomplete(service.map);
        service.watchPosition();
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
            defer.resolve(position);
          },
          function(){
            console.log('getCurrentPosition error');
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
          var coords = {};
          coords.accuracy = position.coords.accuracy;
          coords.latitude = position.coords.latitude;
          coords.longitude = position.coords.longitude;

          var date = Date.now();
          position = {
            coords: coords,
            timestamp: date
          };

          // position.coords.heading = position.coords.heading || 0;
          service.currentPosition = position;

          var rooms = SessionService.roomsList;
          for(var key in rooms) {
            var room = rooms[key];
            if(room.update === 'live' || room.name === SessionService.currentRoom) {
              service.storeCurrentPosition(room.name);
            }
          }
        },
        function(){
          console.log('watchPosition error')
        },{'enableHighAccuracy':true,'timeout':10000,'maximumAge':0}
      );
    },
    displayMap: function(position) {
      var username = SessionService.sessionUsername;
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      service.map.setCenter(pos);
    },
    displayMarker: function(position, username) {
      if(username === SessionService.sessionUsername) {
        var icon = {
          url: 'img/map/bluedot-18x18.png',
          size: new google.maps.Size(18, 18),
          origin: new google.maps.Point(0,0),
          anchor: new google.maps.Point(9, 9)
        };
        var zIndex = 10;
      } else {
        var icon = {
          url: 'img/map/man-18x32.png',
          size: new google.maps.Size(18, 32),
          origin: new google.maps.Point(0,0),
          anchor: new google.maps.Point(9, 32)
        };
        var zIndex = 9;
      }
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      var marker = new google.maps.Marker({
        position: pos,
        title: username,
        icon: icon,
        zIndex: zIndex
      });

      var infowindow = new google.maps.InfoWindow({
        content: marker.title
      });

      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(service.map, marker);
      });
      return marker;
    },

    storeCurrentPosition: function(roomname, update) {
      var defer = $q.defer();
      var position = service.currentPosition;
      roomname = roomname || SessionService.currentRoom;

      update = update || 'live';
      var username = SessionService.sessionUsername;
      var sessionUserRef = refs.rooms
        .child(roomname)
        .child('Users')
        .child(username);

      sessionUserRef
        .set({
          position: {coords: position.coords, timestamp: position.timestamp},
          update: update
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

    startListeners: function(roomname) {
      // console.log('start listener', roomname);
      MarkerService.startListeners(service.map);

      sessionUsersInRoomRef = refs.rooms.child(roomname).child('Users');
      sessionUsersInRoomRef.on('child_added', function(user) {
        var username = user.name();
        // console.log('Marker added:', username, 'added to', roomname);
        sessionUsersInRoomRef
          .child(username)
          .child('position')
          .once('value', function(position) {
            if(position.val() !== null) {
              var marker = service.displayMarker(position.val(), username);
              service.userMarkers[username] = marker;
              marker.setMap(service.map);
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
              if(service.userMarkers[username]) {
                // console.log('Marker removed:', username, 'removed from', roomname);
                service.userMarkers[username].setMap(null);
              }
              delete service.userMarkers[username];
            } else {
              var pos = new google.maps.LatLng(position.val().coords.latitude, position.val().coords.longitude);
              if(service.userMarkers[username]) {
                service.userMarkers[username].setPosition(pos);
                console.log('Marker updated: ', username, 'in', roomname, $filter('date')(position.val().timestamp, 'mediumTime'));
              } else {
                var marker = service.displayMarker(position.val(), username);
                service.userMarkers[username] = marker;
                marker.setMap(service.map);
              }
            }
          });
      });

      // user leaves room
      sessionUsersInRoomRef.on('child_removed', function(user) {
        var username = user.name();
        // console.log('Marker removed:', username, 'removed from', roomname);
        service.userMarkers[username].setMap(null);
        delete service.userMarkers[username];
      });
    },

    stopListeners: function(roomname) {
      refs.rooms.child(roomname).child('Users').off();
      MarkerService.stopListeners();
    },

    logout: function() {
      console.log('clearWatch', service.watchID);
      navigator.geolocation.clearWatch(service.watchID);
      service.stopListeners(SessionService.currentRoom);
      var username = SessionService.sessionUsername;
      var rooms = SessionService.roomsList;
      for(var i = 0; i < rooms.length; i++) {

        var sessionUserRef = refs.rooms
          .child(rooms[i])
          .child('Users')
          .child(username);

        sessionUserRef
          .set({
            active: false
          });
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