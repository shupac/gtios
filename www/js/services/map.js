angular.module('GetTogetherApp')
.factory('MapService', function($http, $q, SessionService){
  var service = {
    markers: {},
    initializeMap: function(roomname) {
      console.log('initializeMap');
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
          // service.watchPosition();        
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
        service.storePosition,
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
    // storePosition: function(position) {
    //   var username = SessionService.getUsername();
    //   refs.users.child(username).child('position').set({coords: position.coords, timestamp: position.timestamp});
    //   console.log('Watch location:', SessionService.getUsername(), 'moved');
    // },

    storePosition: function(position) {
      var defer = $q.defer();
      var currentRoom = SessionService.currentRoom;
      var username = SessionService.getUsername();
      refs.rooms
        .child(currentRoom)
        .child('Users')
        .child(username)
        .child('position')
        .set({coords: position.coords, timestamp: position.timestamp},
          function(error) {
            if (error) {
              console.log('position could not be saved.' + error);
            } else {
              console.log('position saved successfully.');
              defer.resolve();
            }
          });
      return defer.promise;
    },

    stopListeners: function(roomname) {
      // debugger
      if(SessionService.currentRoom) {
        refs.rooms.child(roomname).child('Users').off();
      }
    },

    startListeners: function(roomname) {
      console.log('start listener/110', roomname);
      currentUsersInRoomRef = refs.rooms.child(roomname).child('Users');
      currentUsersInRoomRef.on('child_added', function(user) {
        console.log('child added', user.val());
        console.log(user.name(), 'entered room');
        var marker = service.displayMarker(user.val().position, user.name());
        service.markers[user.name()] = marker;
        marker.setMap(service.map);
      });

      // currentUsersInRoomRef.on('child_removed', function(user) {
      //   // console.log(user.val());
      //   console.log(user.name(), 'logged out');
      //   service.markers[user.name()].setMap(null);
      //   delete service.markers[user.name()];
      // });

      // currentUsersInRoomRef.on('child_changed', function(user) {
      //   console.log(user.val());
      //   console.log(user.name(), 'marker moved');
      //   var position = user.val().position;
      //   var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      //   service.markers[user.name()].setPosition(pos);
      // });
    },
    logout: function() {
      console.log('clearWatch', service.watchID);
      navigator.geolocation.clearWatch(service.watchID);
    }
  };
  return service;
});