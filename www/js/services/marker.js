angular.module('GetTogetherApp')
.factory('MarkerService', function($q, $timeout, SessionService, PanService){
  var service = {
    savedMarkers: {},
    // saves place in Firebase
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
    // starts listeners for any changes to places in the room
    startListeners: function(map) {
      service.map = map;
      service.places = new google.maps.places.PlacesService(map);

      // Change to storing place reference
      // Retrieve by place reference

      var roomname = SessionService.currentRoom;
      var username = SessionService.sessionUsername;
      var markersRef = refs.rooms.child(roomname).child
      ('Places');

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
                url: 'img/map/marker_small_green.png',
                size: new google.maps.Size(12, 20),
                origin: new google.maps.Point(0,0),
                anchor: new google.maps.Point(6, 20)
              };
              var marker = new google.maps.Marker({
                position: place.geometry.location,
                icon: icon
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
        console.log('place changed', data.val());
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

      PanService.panInfoWindow(place, service.map);

      var timeString = '';
      if(marker.time) {
        timeString = '<p>Time: ' + marker.time + '</p>';
      }

      if(place.photos) {
        // console.log('photos', place.photos[0].getUrl({'maxWidth': 180, 'maxHeight': 120}));
        var photoUrl = place.photos[0].getUrl({'maxWidth': 180, 'maxHeight': 120});
      }

      var contentString = 
        '<div id="info-window"><p>' + marker.name + '</p>' +
        timeString +
        '<p>' + place.formatted_address.split(",")[0] + '</p>' + 
        // '<img src="' + place.icon + '"/><hr>' +
        '<img src="' + photoUrl + '"/>' +
        '<div class="popup-bar"><button id="edit-marker" class="blue">Edit</button><button id="delete-marker" class="gray">Delete</button></div></div>';

      if(service.infoWindow) {
        service.infoWindow.close();
        delete service.infoWindow;
      }

      service.infoWindow = new google.maps.InfoWindow({maxWidth: 200});
      service.infoWindow.setContent(contentString);
      service.infoWindow.open(service.map, marker);

      google.maps.event.addListener(service.infoWindow, 'domready', function() {
        document.getElementById('edit-marker').addEventListener('click', function() {
          service.infoWindow.close();
          service.editMarker(marker);
          this.removeEventListener('click', arguments.callee, false);
        });
        document.getElementById('delete-marker').addEventListener('click', function() {
          service.deleteMarker(marker);
          this.removeEventListener('click', arguments.callee, false);
        });
      });
    },
    editMarker: function(marker) {
      var roomname = SessionService.currentRoom;
      var place = marker.placeResult;

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
        this.removeEventListener('click', arguments.callee, false);
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
        this.removeEventListener('click', arguments.callee, false);
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
