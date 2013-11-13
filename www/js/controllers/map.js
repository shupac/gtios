



  $scope.createRoom = function(roomname) {
    roomname = roomname.toLowerCase();
    RoomService.create(roomname)
    .then(
      function(roomname){
        $scope.roomsClass = 'hiddenLeft';
      }, 
      function() {
        navigator.notification.alert(
          "The group '" + roomname + "' has already been taken. Please choose a different group name",
          $scope.joinRoom
        );
      }
    );
  };

  $scope.joinRoom = function(roomname) {
    roomname = roomname.toLowerCase();
    RoomService.joinRoom(roomname)
    .then(
      function() {
        $scope.roomsClass = 'hiddenLeft';
      }, 
      function() {
        navigator.notification.alert(
          "The group '" + roomname + "' does not exist. Please select a different group",
          null
        );
      }
    );
  };

  $scope.join = function() {
    // navigator.notification.prompt(
    //   'Enter the group name',
    //   function(result) {
    //     if(result.buttonIndex === 1) {
    //       $scope.joinRoom(result.input1);
    //     }
    //   },
    //   'Join Group',
    //   ['Join','Cancel'],
    //   'public'
    // );
  };

  $scope.create = function() {
    // navigator.notification.prompt(
    //   'Enter the group name',
    //   function(result) {
    //     if(result.buttonIndex === 1) {
    //       $scope.createRoom(result.input1);
    //     }
    //   },
    //   'Create Group',
    //   ['Create','Cancel'],
    //   'new'
    // );
  };

  $scope.deleteRoom = function(roomname) {
    RoomService.deleteRoom(roomname)
    .then(function() {
      console.log('left room');
    });
  }

  $scope.logout = function() {
    MapService.logout();
    SessionService.logout();
  };