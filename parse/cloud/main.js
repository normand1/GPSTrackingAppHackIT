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
                var isInAllowedLocation = false;
                for (var i = 0; i < results.length; i++) {
                    //iterate through each allowed location and check bounds
                    if (!isInAllowedLocation && results[i].get("location").kilometersTo(pingLocation) < results[i].get("radius")) {
                        //the user is inside of allowed area
                        isInAllowedLocation = true;
                    }
                    if (debugMode) {
                        console.log("location:" + results[i].get("location"));
                        console.log("radius:" + results[i].get("radius"));
                        console.log("isInAllowedLocation:" + isInAllowedLocation);
                    }
                }

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
                                                response.success("false");
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
                                            response.success("true");
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
            },
            error: function (error) {
                response.error("Unable to complete AllowedLocations query");
            }
        });

        
    });
});

function alertSubscribersForUser(user) {
    var subscriberArray = user.get("alertSubscribers");
    //if (debugMode) {
    //    console.log("Alerting subscribers");
    //    console.log(subscriberArray);
    //}

    //for (var i = 0; i < subscriberArray.length; i++) {
    //    //var sendAlert =
    //        sendSMSAlert(subscriberArray[i]);
    //    //Parse.Promise.when(sendAlert).then(function (result) {
    //    //    if (i == subscriberArray.length - 1) return 0;
    //    //});
    //}
    //return;

    Parse.Promise.as().then(function () {
        var promises = [];

        for (var i = 0; i < subscriberArray.length; i++) {
            promises.push(sendSMSAlert(subscriberArray[i]));
        }

        return Parse.Promise.when(promises);
    }).then(function (result) {
        //response.success("false");
        return result;
    }, function (error) {
        //response.error(error);
        return error;
    });
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
                    text: "User has left allowed location",
                    subject: "Proximity Alert",
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
                    //return 0;
                },
                error: function (httpResponse) {
                    if (debugMode) console.error(httpResponse);
                    //return 0;
                }
            });
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and description.
            if (debugMode) console.log("Error retrieving alert subscriber phone number");
        }
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