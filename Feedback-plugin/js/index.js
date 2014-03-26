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
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        navigator.splashscreen.hide();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    getSystemInfo: function() {
        window.feedback.getSystemInfo(getSysInfoSuccess, getSysInfoError);
        
        function getSysInfoSuccess(systemInfo) {
            console.log('System Info:');
            console.log('model: ' + systemInfo.model);
            console.log('appVersion: ' + systemInfo.appVersion);
            console.log('cordova: ' + systemInfo.cordova);
            console.log('appId: ' + systemInfo.appId);
            console.log('OSVersion: ' + systemInfo.OSVersion);
            console.log('widthInPixels: ' + systemInfo.widthInPixels);
            console.log('heightInPixels: ' + systemInfo.heightInPixels);
            console.log('uuid: ' + systemInfo.uuid);
            console.log('userAgent: ' + systemInfo.userAgent);
        };
        
        function getSysInfoError(error) {
            console.log('Error: ' + error);
        };
    },
    getScreenshot: function() {
        window.feedback.getScreenshot(getScreenshotSuccess, getScreenshotError);
        
        function getScreenshotSuccess(screenshot) {
            console.log('screenshot as base64 text: ' + screenshot);
        };
        
        function getScreenshotError(error) {
            console.log('Error: ' + error);
        };

    }
};
