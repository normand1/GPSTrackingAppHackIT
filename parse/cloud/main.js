// App variables
var ALERT_RADIUS = 20;
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
                    //sendSMSAlert(pingUser).then(function () {
                    alertSubscribersForUser(pingUser).then(function () {
                        response.success(false);
                    });
                } else {
                    response.success(true);
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
    for (var i = 0; i < subscriberArray.length; i++) {
        sendSMSAlert(subscriberArray[i]);
    }
}

function sendSMSAlert(targetUser) {
    if (debugMode) {
        console.log("Sending SMS");
        //return; //remove when ready to test sms
    }

    var Mandrill = require('mandrill');
    Mandrill.initialize('AHaK4-FxJJB5CqTMAIddQw');

    Mandrill.sendEmail({
        message: {
            text: "User has left allowed location",
            subject: "Proximity Alert",
            from_email: "ch4ch4@gmail.com",
            from_name: "Cisco Vigil",
            to: [
            {
                email: getPhonenumberForUser(targetUser) + "@txt.att.net",
                name: "Vigil User"
            }
            ]
        },
        async: true
    }, {
        success: function (httpResponse) {
            if (debugMode) console.log(httpResponse);
            return;
        },
        error: function (httpResponse) {
            if (debugMode) console.error(httpResponse);
            return;
        }
    });
}

function getPhonenumberForUser(userId) {
    Parse.Cloud.useMasterKey();

    var UserObject = Parse.Object.extend("User");
    var userObjectQuery = new Parse.Query(UserObject);
    userObjectQuery.get(userId, {
        success: function (userObject) {
            // The object was retrieved successfully.
            var number = userObject.get("phonenumber");
            if (debugMode) console.log("Sending SMS to number: " + number);

            return number;
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and description.
            if (debugMode) console.log("Error retrieving alert subscriber phone number");
            
            return;
        }
    });

}

Parse.Cloud.define("Panic", function (request, response) {
    alertSubscribersForUser(request.user);
});
