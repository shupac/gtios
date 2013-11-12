angular.module('GetTogetherApp')
.directive('editWindow', function(){
  return {
    restrict: 'E',
    // template: '<div id="info-window"><p>hello world</p>' +
    // '<button id="save-marker">Save</button><button id="hide-marker">Hide</button></div>',
    template: '<div><p>hello world</p></div>',
    link: function(scope, elem, attrs) {
      console.log(attrs);
    }
  }
});
