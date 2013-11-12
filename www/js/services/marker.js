angular.module('GetTogetherApp')
.factory('MarkerService', function($q, $timeout, SessionService, PanService){
  var service = {
    savedMarkers: {},
    savePlace: function(reference, id, name, url) {
      var defer = $q.defer();
      var roomname = SessionService.currentRoom;
      var username = SessionService.sessionUsername;
      var markersRef = refs.rooms.child(roomname).child('Places');
      if(service.savedMarkers[id]) {
        console.log('location already saved');
        defer.reject();
      } else {
        markersRef.child(id).set({reference: reference, name: name}, function(error) {
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
        var placeName = data.val().name;
        var placeTime = data.val().time;
        var placeReference = data.val().reference;

        service.places.getDetails({reference: placeReference},
          function(place, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
              return;
            } else {
              var icon = {
                url: 'img/map/reddot-18x18.png',
                size: new google.maps.Size(18, 18),
                origin: new google.maps.Point(0,0),
                anchor: new google.maps.Point(9, 9)
              };
              var marker = new google.maps.Marker({
                position: place.geometry.location,
                icon: icon,
                zIndex: 1,
              });
              marker.placeResult = place;
              marker.name = placeName;
              marker.time = placeTime;
              $timeout(function() {
                service.savedMarkers[placeId] = marker;
              });
              marker.setMap(map);
              google.maps.event.addListener(marker, 'click', service.showInfoWindow);
            }
          });
      });

      markersRef.on('child_changed', function(data) {
        var placeId = data.name();
        var marker = service.savedMarkers[placeId];

        $timeout(function() {
          marker.name = data.val().name;
          marker.time = data.val().time;          
        });
      });

      markersRef.on('child_removed', function(data) {
        var placeId = data.name();
        var marker = service.savedMarkers[placeId];
        marker.setMap(null);
        $timeout(function() {
          delete service.savedMarkers[placeId];
        });
        console.log(service.savedMarkers);
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
      var roomname = SessionService.currentRoom;
      var marker = this;
      var place = marker.placeResult;

      PanService.panInfoWindow(place, service.map);

      var timeString = '';
      if(marker.time) {
        timeString = '<p>Time: ' + marker.time + '</p>';
      }
      var contentString = 
        '<div id="info-window"><p>' + marker.name + '</p>' +
        timeString +
        '<p>' + place.formatted_address.split(",")[0] + '</p>' + 
        '<img src="' + place.icon + '"/><hr>' +
        '<button id="edit-marker">Edit</button><button id="delete-marker">Delete</button></div>';
      var infoWindow = new google.maps.InfoWindow({
        content: contentString
      });
      
      infoWindow.open(service.map, marker);
      infoWindow.marker = marker;
      
      google.maps.event.addListener(infoWindow, 'domready', function() {
        document.getElementById('edit-marker').addEventListener('click', function() {
          infoWindow.close();
          var editWindow = document.getElementById('edit-window');
          var editName = document.getElementById('edit-place-name');
          var editTime = document.getElementById('edit-place-time');
          var editImg = document.getElementById('edit-place-img');
          
          editWindow.className = '';
          editName.value = marker.name;
          editImg.src = place.icon;
          editTime.value = marker.time || '';

          document.getElementById('edit-place-address-1').textContent = place.formatted_address.split(",")[0];
          document.getElementById('edit-place-address-2').textContent = place.formatted_address.split(",")[1];
          document.getElementById('edit-place-address-3').textContent = place.formatted_address.split(",")[2];

          document.getElementById('edit-place-cancel').addEventListener('click', function() {
            editWindow.className = "hidden";
          });
          document.getElementById('edit-place-save').addEventListener('click', function() {
            editWindow.className = "hidden";
            marker.name = editName.value;
            marker.time = editTime.value;

            refs.rooms
              .child(roomname)
              .child('Places')
              .child(place.id)
              .set({
                name: marker.name,
                time: marker.time,
                reference: place.reference
              });
          });
        });
        document.getElementById('delete-marker').addEventListener('click', function() {
          service.deleteMarker(marker);
        });
      });
    },

    deleteMarker: function(marker) {
      var roomname = SessionService.currentRoom;
      var username = SessionService.sessionUsername;
      var markersRef = refs.rooms.child(roomname).child('Places');

      var placeId = marker.placeResult.id;
      markersRef.child(placeId).remove();
    }
  };
  return service;
});
