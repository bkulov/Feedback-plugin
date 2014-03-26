'use strict';
var cordova = require('cordova'),
    exec = require('cordova/exec'),
    API_BASE_URL = 'https://platform.telerik.com/feedback/api/v1',
    COMMENTS_PAGE_SIZE = 10;

function createXHR(successCallback, errorCallback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4) {
            if (request.status == 200) {
                try {
                    var result = JSON.parse(request.response);
                    successCallback(result);
                } catch (e) {
                    successCallback(request.response);
                }
            }
            else {
                try {
                    var errorJson = JSON.parse(request.response);
                    errorCallback(errorJson);
                } catch (e) {
                    errorCallback(request.status);
                }
            }
        }
    };

    return request;
}

function validatePageOptions(options) {
    if(options) {
        if(options.page && options.page < 1) {
            throw new Error('Page option must be a positive, non-zero number.');
        }

        if(options.pageSize && options.pageSize < 0) {
            throw new Error('Page size option must be a non-negative number.');
        }
    }
}

function prepareTakeSkipHeaders (request, take, skip) {
    if(take) {
        request.setRequestHeader('x-take-meta', JSON.stringify(take));
    }

    if(skip) {
        request.setRequestHeader('x-skip-meta', JSON.stringify(skip));
    }
}

function FeedbackImage(base64Data) {
    return {
        'Filename' : 'screenshot.png',
        'Content-type' : 'image/png',
        'base64': base64Data
    };
}

var Feedback = function() {
    var _isInitialized = false;

    this.initialize = function(apiKey, options) {
        if(typeof apiKey !== 'string' || apiKey === '' || !apiKey.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            throw new Error('Please use a proper apiKey for initialization');
        }

        this.apiKey = apiKey;
        _isInitialized = true;
    };

    this.ensureInitialized = function(){
        if(!_isInitialized) {
            throw new Error('Feedback plugin needs to be initialized with an API key before usage. Please use feedback.initialize() to perform initialization.');
        }
    };
};

Feedback.prototype.getSystemInfo = function(successCallback, errorCallback) {
    function prepareDeviceInfo(deviceInfo) {
        deviceInfo.userAgent = navigator.userAgent;
        successCallback(deviceInfo);
    }

    cordova.exec(prepareDeviceInfo, errorCallback, 'TLRKFeedback', 'getSystemInfo', []);
};

Feedback.prototype.getScreenshot = function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'TLRKFeedback', 'getScreenshot', []);
};

Feedback.prototype.getFeedback = function(feedbackId, options, successCallback, errorCallback) {
    this.ensureInitialized();
    var that = this;

    if(arguments.length == 3) {
        // assume options are not passed
        feedbackId = arguments[0];
        successCallback = arguments[1];
        errorCallback = arguments[2];
        options = undefined;
    }

    if(!feedbackId) {
        throw new Error('Please use a feedback Id as a first parameter.');
    }

    validatePageOptions(options);
    options = options || {};
    var page = options.page;
    var pageSize = options.pageSize || COMMENTS_PAGE_SIZE;

    if(page && pageSize) {
        sendRequest(pageSize, (page - 1) * pageSize);
    }
    else {
        sendRequest(pageSize, page);
    }

    function sendRequest (take, skip) {
        var request = createXHR(successCallback, errorCallback);
        var filter = {
            "$or" : [
                { "Id" : feedbackId },
                { "RootId" : feedbackId }
            ]};

        request.open('GET', API_BASE_URL + '/' + that.apiKey + '/threads');
        request.setRequestHeader('x-filter-meta', JSON.stringify(filter));
        prepareTakeSkipHeaders(request, take, skip);
        request.send();
    }
};

Feedback.prototype.getFeedbackList = function(options, successCallback, errorCallback) {
    this.ensureInitialized();
    var that = this;

    if(arguments.length == 2) {
        // assume options are not passed
        successCallback = arguments[0];
        errorCallback = arguments[1];
        options = undefined;
    }

    options = options || {};
    validatePageOptions(options);

    var page = options.page;
    var pageSize = options.pageSize || COMMENTS_PAGE_SIZE;
    var filter = {
        'RootId' : null
    };

    if(page && pageSize) {
        sendRequest(filter, pageSize, (page - 1) * pageSize);
    }
    else {
        sendRequest(filter, pageSize, page);
    }

    function sendRequest(filter, take, skip) {
        var request = createXHR(successCallback, errorCallback);
        request.open('GET', API_BASE_URL + '/' + that.apiKey + '/threads');
        request.setRequestHeader('x-filter-meta', JSON.stringify(filter));
        prepareTakeSkipHeaders(request, take, skip);
        request.send();
    }
};

Feedback.prototype.postReply = function(feedbackId, replyObj, successCallback, errorCallback) {
    this.ensureInitialized();
    var data = {
        Text : replyObj.text,
        Author : replyObj.author,
        Uid: replyObj.uid
    };

    var request = createXHR(successCallback, errorCallback);
    request.open('POST', API_BASE_URL + '/' + this.apiKey + '/threads/' + feedbackId);
    request.setRequestHeader('Content-type', 'application/json');
    request.send(JSON.stringify(data));
};

Feedback.prototype.postFeedback = function(feedbackObj, successCallback, errorCallback) {
    this.ensureInitialized();
    var that = this;
    var data = JSON.parse(JSON.stringify(feedbackObj));

    function sendRequest(data) {
        var request = createXHR(successCallback, errorCallback);
        request.open('POST', API_BASE_URL + '/' + that.apiKey + '/threads');
        request.setRequestHeader('Content-type', 'application/json');
        request.send(JSON.stringify(data));
    }

    that.getSystemInfo(function(systemInfo) {
        var data = {
            'Text': feedbackObj.text,
            'Author': feedbackObj.author,
            'Uid': feedbackObj.uid,
            'SystemInfo': systemInfo,
            'FbCustomMetadata': feedbackObj.metadata
        };

        if(!feedbackObj.imageData) {
            that.getScreenshot(function(base64Image){
                data.Image = new FeedbackImage(base64Image);
                sendRequest(data);
            }, errorCallback);
        }
        else {
            data.Image = new FeedbackImage(feedbackObj.imageData);
            sendRequest(data);
        }
    }, errorCallback);
};

var feedback = new Feedback();
module.exports = feedback;
