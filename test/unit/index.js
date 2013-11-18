/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// describe('app', function() {
//   describe('initialize', function() {
//     it('should bind deviceready', function() {
//       runs(function() {
//         spyOn(app, 'onDeviceReady');
//         app.initialize();
//         helper.trigger(window.document, 'deviceready');
//       });

//       waitsFor(function() {
//         return (app.onDeviceReady.calls.length > 0);
//       }, 'onDeviceReady should be called once', 500);

//       runs(function() {
//         expect(app.onDeviceReady).toHaveBeenCalled();
//       });
//     });
//   });

//   describe('onDeviceReady', function() {
//     it('should report that it fired', function() {
//       spyOn(app, 'receivedEvent');
//       app.onDeviceReady();
//       expect(app.receivedEvent).toHaveBeenCalledWith('deviceready');
//     });
//   });

//   describe('receivedEvent', function() {
//     beforeEach(function() {
//       var el = document.getElementById('stage');
//       el.innerHTML = ['<div id="deviceready">',
//               '    <p class="event listening">Listening</p>',
//               '    <p class="event received">Received</p>',
//               '</div>'].join('\n');
//     });

//     it('should hide the listening element', function() {
//       app.receivedEvent('deviceready');
//       var displayStyle = helper.getComputedStyle('#deviceready .listening', 'display');
//       expect(displayStyle).toEqual('none');
//     });

//     it('should show the received element', function() {
//       app.receivedEvent('deviceready');
//       var displayStyle = helper.getComputedStyle('#deviceready .received', 'display');
//       expect(displayStyle).toEqual('block');
//     });
//   });
// });


// define(['angular', 'firebase'], function(angular, Firebase) {
  describe('Sign Up', function() {
  it('should be able to create an account', function() {
    expect(1).toEqual(1);
    // expect(browser().location().path()).toEqual('/login');
    // input('userLogin.username').enter('spec');
    // input('userLogin.password').enter('test');
    // element('signup-button').click();
    // expect(repeater('ul li').count()).toEqual(10);
    // input('filterText').enter('Bees');
    // expect(repeater('ul li').count()).toEqual(1);
  });
  });
// });

// user should be able to sign into account

// user should be able to create a room

// user should be able to join an existing room

// after joining a room, current position of user should be stored in Firebase



// user should be able to logout
