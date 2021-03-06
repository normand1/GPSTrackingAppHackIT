var Mandrill = require('mandrill');
Mandrill.initialize('AHaK4-FxJJB5CqTMAIddQw');
// App variables
var debugMode = true;

Parse.Cloud.define("Ping", function (request, response) {

    var pingUser = request.user;
    var lat = parseFloat(request.params.latitude);
    var lon = parseFloat(request.params.longitude);
    var pingLocation = new Parse.GeoPoint(lat, lon);

    if (debugMode) {
        console.log(request);
        console.log("userid:" + pingUser);
        console.log("lat:" + lat);
        console.log("lon:" + lon);
    }

    //insert code here to check ping location and trigger alerts
    var LocationObject = Parse.Object.extend("Location");
    var locationObject = new LocationObject();
    if (debugMode) console.log("saving ping");
    locationObject.save({ location: pingLocation, user: pingUser }, {
        success: function (object) {
            //response.success("PONG");
            if (debugMode) console.log("ping saved");
            return object;
        },
        error: function (model, error) {
            //response.error("Unable to save ping");
            if (debugMode) {
                console.log("ping not saved: ");
                console.log(error);
            }
            return;
        }
    }).then(function (object) {
        var allowedLocationQuery = new Parse.Query("AllowedLocations");
        allowedLocationQuery.equalTo("user", pingUser); //search AllowedLocations table for the user's allowed locations
        allowedLocationQuery.find({
            success: function (results) {
                // results is an array of Parse.Object.
                var isInAllowedLocation;
                var promises = [];

                for (var i = 0; i < results.length; i++) {
                    //iterate through each allowed location and check bounds
                    //if (!isInAllowedLocation && results[i].get("location").kilometersTo(pingLocation) < results[i].get("radius")) {
                    //    //the user is inside of allowed area
                    //    isInAllowedLocation = true;
                    //}
                    if (debugMode) {
                        console.log("location:" + results[i].get("location"));
                        console.log("radius:" + results[i].get("radius"));
                        //console.log("isInAllowedLocation:" + isInAllowedLocation);
                    }
                    promises.push(results[i].get("location").kilometersTo(pingLocation) < results[i].get("radius"));
                }

                Parse.Promise.when(promises).then(function () {
                    //this is the success
                    // take a look at what was passed here:
                    console.log(arguments);
                    for (var i = 0; i < arguments.length; i++) {
                        //console.log(arguments[i]);
                        if (arguments[i]) {
                            //do nothing
                        } else {
                            isInAllowedLocation = false;
                            return false;
                        }
                    }
                }, function () {
                    // this is the error function
                    console.log(arguments);
                }).then(function (returnValue) {
                    if (returnValue === false) {
                        //this means that the user is out of bounds
                        if (debugMode) console.log("updating outOfBounds to true");
                        Parse.Cloud.useMasterKey();
                        pingUser.fetch({
                            success: function (fetchedUser) {
                                Parse.Cloud.useMasterKey();
                                fetchedUser.save(fetchedUser, {
                                    success: function (res) {
                                        Parse.Cloud.useMasterKey();
                                        res.set("outOfBounds", true);
                                        res.save(res, {
                                            success: function (res2) {
                                                //response.success("false");
                                                if (debugMode) console.log(res2);
                                            },
                                            error: function (model, error) {
                                                //response.error(error);
                                                response.error("Unable to complete AllowedLocations query");
                                            }
                                        }).then(function () {
                                            //alertSubscribersForUser(pingUser);
                                            Parse.Promise.as().then(function () {
                                                function callback() {
                                                    if (!--callback.count) {
                                                        response.success();
                                                    }
                                                }
                                                callback.count = pingUser.get("alertSubscribers").length;

                                                for (var i = 0; i < pingUser.get("alertSubscribers").length; i++) {
                                                    //promises.push(sendSMSAlert(pingUser.get("alertSubscribers")[i]));
                                                    Parse.Cloud.useMasterKey();
                                                    var userQuery = new Parse.Query("User");

                                                    if (debugMode) {
                                                        console.log("Fetching subscriber phone number");
                                                        console.log(pingUser.get("alertSubscribers"));
                                                    }

                                                    userQuery.get(pingUser.get("alertSubscribers")[i], {
                                                        success: function (user) {
                                                            console.log("got user object");
                                                            return user.fetch();
                                                        },
                                                        error: function (object, error) {
                                                            // The object was not retrieved successfully.
                                                            // error is a Parse.Error with an error code and description.
                                                            if (debugMode) console.log("Error retrieving alert subscriber phone number");
                                                        }
                                                    }).then(function (user) {
                                                        console.log("Sending email");
                                                        Mandrill.sendEmail({
                                                            message: {
                                                                text: user.get("username") + " has left the allowed location",
                                                                subject: "Proximity Alert For " + user.get("username"),
                                                                from_email: "ch4ch4@gmail.com",
                                                                from_name: "Cisco Vigil",
                                                                to: [
                                                                {
                                                                    //email: "ch4ch4@gmail.com",
                                                                    email: user.get("phonenumber") + "@txt.att.net",
                                                                    name: "Vigil User"
                                                                }
                                                                ]
                                                            },
                                                            async: true
                                                        }, {
                                                            success: function (httpResponse) {
                                                                if (debugMode) console.log(httpResponse);
                                                                callback();
                                                            },
                                                            error: function (httpResponse) {
                                                                if (debugMode) console.error(httpResponse);
                                                                callback();
                                                            }
                                                        });
                                                    });
                                                }
                                                
                                            });
                                        });
                                    },
                                    error: function (res, error) {
                                        // The save failed.  Error is an instance of Parse.Error.
                                        response.error("Unable to complete AllowedLocations query");
                                    }
                                });
                            },
                            error: function (myObject, error) {
                                // The object was not refreshed successfully.
                                // error is a Parse.Error with an error code and description.
                                response.error("Unable to complete AllowedLocations query");
                            }
                        });
                    } else {
                        //this means that the user is not out of bounds
                        if (debugMode) console.log("updating outOfBounds to false");
                        Parse.Cloud.useMasterKey();
                        pingUser.fetch({
                            success: function (fetchedUser) {
                                Parse.Cloud.useMasterKey();
                                fetchedUser.save(fetchedUser, {
                                    success: function (res) {
                                        Parse.Cloud.useMasterKey();
                                        res.set("outOfBounds", false);
                                        res.save(res, {
                                            success: function (res2) {
                                                //response.success("true");
                                                if (debugMode) console.log(res2);
                                            },
                                            error: function (model, error) {
                                                //response.error(error);
                                                response.error("Unable to complete AllowedLocations query");
                                            }
                                        }).then(function () {
                                            response.success();
                                        });
                                    },
                                    error: function (res, error) {
                                        // The save failed.  Error is an instance of Parse.Error.
                                        response.error("Unable to complete AllowedLocations query");
                                    }
                                });
                            },
                            error: function (myObject, error) {
                                // The object was not refreshed successfully.
                                // error is a Parse.Error with an error code and description.
                                response.error("Unable to complete AllowedLocations query");
                            }
                        });
                    }
                });
                /*
                if (!isInAllowedLocation) {
                    //var sendAlerts =
                        alertSubscribersForUser(pingUser);
                    //Parse.Promise.when(alertSubscribersForUser(pingUser)).then(function (result) {
                    ////alertSubscribersForUser(pingUser);
                        //response.success("false");
                    //});
                        Parse.Cloud.useMasterKey();
                        pingUser.fetch({
                            success: function (fetchedUser) {
                                fetchedUser.save(null, {
                                    success: function (res) {
                                        res.set("outOfBounds", true);
                                        res.save(null, {
                                            success: function (res2) {
                                                //response.success("false");
                                            },
                                            error: function (model, error) {
                                                //response.error(error);
                                                response.error("Unable to complete AllowedLocations query");
                                            }
                                        });
                                    },
                                    error: function (res, error) {
                                        // The save failed.  Error is an instance of Parse.Error.
                                        response.error("Unable to complete AllowedLocations query");
                                    }
                                });
                            },
                            error: function (myObject, error) {
                                // The object was not refreshed successfully.
                                // error is a Parse.Error with an error code and description.
                                response.error("Unable to complete AllowedLocations query");
                            }
                        });
                } else {
                    Parse.Cloud.useMasterKey();
                    pingUser.fetch({
                        success: function (fetchedUser) {
                            fetchedUser.save(null, {
                                success: function (res) {
                                    res.set("outOfBounds", false);
                                    res.save(null, {
                                        success: function (res2) {
                                            //response.success("true");
                                        },
                                        error: function (model, error) {
                                            //response.error(error);
                                            response.error("Unable to complete AllowedLocations query");
                                        }
                                    });
                                },
                                error: function (res, error) {
                                    // The save failed.  Error is an instance of Parse.Error.
                                    response.error("Unable to complete AllowedLocations query");
                                }
                            });
                        },
                        error: function (myObject, error) {
                            // The object was not refreshed successfully.
                            // error is a Parse.Error with an error code and description.
                            response.error("Unable to complete AllowedLocations query");
                        }
                    });
                }
                */
            },
            error: function (error) {
                response.error("Unable to complete AllowedLocations query");
            }
        });

        
    });
});

function alertSubscribersForUser(user) {
    var subscriberArray = user.get("alertSubscribers");
    if (debugMode) {
        console.log("Alerting subscribers");
        console.log(subscriberArray);
    }

    for (var i = 0; i < subscriberArray.length; i++) {
        //var sendAlert =
            sendSMSAlert(subscriberArray[i]);
        //Parse.Promise.when(sendAlert).then(function (result) {
        //    if (i == subscriberArray.length - 1) return 0;
        //});
    }
    //return;

    //Parse.Promise.as().then(function () {
    //    var promises = [];

    //    for (var i = 0; i < user.get("alertSubscribers").length; i++) {
    //        promises.push(sendSMSAlert(user.get("alertSubscribers")[i]));
    //    }

    //    return Parse.Promise.when(promises);
    //}).then(function (result) {
    //    //response.success("false");
    //    return result;
    //}, function (error) {
    //    //response.error(error);
    //    return error;
    //});
}

function sendSMSAlert(targetUser) {
    if (debugMode) {
        console.log("Preparing to send SMS to: " + targetUser);
        //return; //remove when ready to test sms
    }

    //var Mandrill = require('mandrill');
    //Mandrill.initialize('AHaK4-FxJJB5CqTMAIddQw');

    //var number = getPhonenumberForUser(targetUser);

    //Parse.Promise.when(number).then(function (result) {
    Parse.Cloud.useMasterKey();
    var userQuery = new Parse.Query("User");

    if (debugMode) console.log("Fetching subscriber phone number");

    userQuery.get(targetUser, {
        success: function (user) {
            Mandrill.sendEmail({
                message: {
                    text: user.get("username") + " has left the allowed location",
                    subject: "Proximity Alert For " + user.get("username"),
                    from_email: "ch4ch4@gmail.com",
                    from_name: "Cisco Vigil",
                    to: [
                    {
                        email: "ch4ch4@gmail.com",
                        //email: user.get("phonenumber") + "@txt.att.net",
                        name: "Vigil User"
                    }
                    ]
                },
                async: true
            }, {
                success: function (httpResponse) {
                    if (debugMode) console.log(httpResponse);
                    return true;
                },
                error: function (httpResponse) {
                    if (debugMode) console.error(httpResponse);
                    return false;
                }
            });
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and description.
            if (debugMode) console.log("Error retrieving alert subscriber phone number");
        }
    }).then(function (result) {
        return result;
    });

    //});
}

function getPhonenumberForUser(userId) {
    Parse.Cloud.useMasterKey();
    var user = new Parse.User;
    user.id = userId;

    if (debugMode) console.log("Fetching subscriber phone number");

    user.fetch({
        success: function(user){
            return user.get("phonenumber");
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and description.
            if (debugMode) console.log("Error retrieving alert subscriber phone number");
        }
    });
}

Parse.Cloud.define("Panic", function (request, response) {
    alertSubscribersForUser(request.user);
});

Parse.Cloud.define("CheckIfUserOutOfBounds", function (request, response) {
    var userId = request.params.userId;

    Parse.Cloud.useMasterKey();
    var user = new Parse.User;
    user.id = userId;

    user.fetch({
        success: function (user) {
            response.success(user.get("outOfBounds"));
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and description.
            if (debugMode) console.log("Error retrieving user's outOfBounds status");
            response.error(error);
        }
    });
});

Parse.Cloud.define("CiscoVoice", function (request, response) {
    var sr =
                '<?xml version="1.0" encoding="utf-8"?>' +
                '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
                    '<soap:Body>' +
      '<in0 xmlns="urn:Message" xmlns:ext="urn:MessageExtension">' +
         '<ext:Recipients>' +
            '<ext:name>mobile_phone</ext:name>' +
            '<ext:value>+14156466297</ext:value>' +
         '</ext:Recipients>' +
         '<type>RMA_ETA_Notification_SMS</type>' +
         '<subject>RMA_ETA_Notification_SMS English</subject>' +
         '<data>RMA_ETA_Notification_SMS English</data>' +
         '<priority>3</priority>' +
         '<creationDate>2012-01-06T18:00:00.000Z</creationDate>' +
         '<lang>en</lang>' +
         '<actions/>' +
      '</in0>' +
   '</soap:Body>' +
'</soap:Envelope>';



    Parse.Cloud.httpRequest({
        method: 'POST',
        url: 'https://www.ciscocebt.com/PCA/Proxy/services/EventHandling?wsdl',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: sr,
        success: function (httpResponse) {
            console.log(httpResponse.text);
            response.success();
        },
        error: function (httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
        }
    });
});