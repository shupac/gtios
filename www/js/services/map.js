angular.module('GetTogetherApp')
.factory('MapService', function($http, $q, SessionService){
  var service = {
    markers: {},
    initializeMap: function(roomname) {
      console.log('initializeMap');
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
        position.coords.heading = position.coords.heading || 0;
        service.displayMap(position);
        service.storePosition(position);
        console.log('Current position stored in Firebase', position);
        service.watchPosition();
      })
      .then(function() {
        service.startListeners(roomname);
      });
    },
    getLocation: function() {
      var defer = $q.defer();
      console.log('getLocation');
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(position) {
            defer.resolve(position);
          },
          function(){
            console.log('getCurrentPosition error')
          }, {'enableHighAccuracy':true,'timeout':10000,'maximumAge':5000}
        );
      } else {
        console.log("Browser doesn't support Geolocation");
      }
      return defer.promise;
    },
    watchPosition: function() {
      console.log('watchPosition started');
      service.watchID = navigator.geolocation.watchPosition(
        function(position) {
          SessionService.fetchRooms()
          .then(function(rooms) {
            for(var i = 0; i < rooms.length; i++) {
              service.storePosition(position, rooms[i]);
            }
          });
        },
        function(){
          console.log('watchPosition error')
        },{'enableHighAccuracy':true,'timeout':10000,'maximumAge':5000}
      );
    },
    displayMap: function(position) {
      var username = SessionService.getUsername();
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      service.map.setCenter(pos);
    },
    displayMarker: function(position, username) {
      console.log(position, username);
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

    storePosition: function(position, roomname) {
      roomname = roomname || SessionService.currentRoom;
      var defer = $q.defer();
      var username = SessionService.getUsername();
      var currentUserRef = refs.rooms
        .child(roomname)
        .child('Users')
        .child(username);

      currentUserRef
        .child('position')
        .set({coords: position.coords, timestamp: position.timestamp},
          function(error) {
            if (error) {
              console.log('position could not be saved.' + error);
            } else {
              console.log('position saved successfully in', roomname);
              defer.resolve();
            }
          });
      currentUserRef
        .child('active')
        .set({active: true});

      return defer.promise;
    },

    stopListeners: function(roomname) {
      if(SessionService.currentRoom) {
        refs.rooms.child(roomname).child('Users').off();
      }
    },

    startListeners: function(roomname) {
      console.log('start listener/110', roomname);
      currentUsersInRoomRef = refs.rooms.child(roomname).child('Users');
      currentUsersInRoomRef.on('child_added', function(user) {
        var username = user.name();
        currentUsersInRoomRef
          .child(username)
          .child('position')
          .once('value', function(position) {
            if(position.val() !== null) {
              console.log(username, 'entered room with position', position.val());
              var marker = service.displayMarker(position.val(), username);
              service.markers[username] = marker;
              marker.setMap(service.map);
            }
          });
      });

      currentUsersInRoomRef.on('child_changed', function(user) {
        // console.log(user.val());
        var username = user.name();
        currentUsersInRoomRef
          .child(username)
          .child('position')
          .once('value', function(position) {
            if(position.val() === null) {
              if(service.markers[username]) {
                console.log(username, 'marker removed');
                service.markers[username].setMap(null);
              }
              delete service.markers[username];
            } else {
              console.log(username, 'changed', position.val());
              var pos = new google.maps.LatLng(position.val().coords.latitude, position.val().coords.longitude);
              service.markers[username].setPosition(pos);
            }
          });
      });

      // currentUsersInRoomRef.on('child_changed', function(user) {
      //   console.log(user.val());
      // });
    },
    logout: function() {
      console.log('clearWatch', service.watchID);
      navigator.geolocation.clearWatch(service.watchID);
      var username = SessionService.getUsername();
      SessionService.fetchRooms()
      .then(function(rooms) {
        for(var i = 0; i < rooms.length; i++) {
          console.log(rooms[i]);

          var currentUserRef = refs.rooms
            .child(rooms[i])
            .child('Users')
            .child(username);

          currentUserRef
            .child('position')
            .remove();
          currentUserRef
            .child('active')
            .set({active: false});
        }
      });
    }
  };
  return service;
});