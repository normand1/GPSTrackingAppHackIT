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
                    sendSMSAlert(pingUser).then(function () {
                        response.success("PONG");
                    });
                } else {
                    response.success("PONG");
                }
            },
            error: function (error) {
                response.error("Unable to complete AllowedLocations query");
            }
        });

        
    });
});

//TODO: send sms alert
//Parse.Cloud.define("sendSMSNotification", function (request, response) {
//    Parse.Cloud.useMasterKey();
        
//});
function sendSMSAlert(user) {
    if (debugMode) {
        console.log("Sending SMS");
    }
}

//TODO: panic button 
function panicButton(user) {
    //get alert subscribers
    
    //for each subscriber: send alert
}

function getPhonenumberForUser(user) {
    Parse.Cloud.useMasterKey();
    var number = user.get("phonenumber");

    return number;
}

