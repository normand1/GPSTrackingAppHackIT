// App variables
var ALERT_RADIUS = 20;

Parse.Cloud.beforeSave("Ping", function (request, response) {
    var user = request.object.get("User");
    var location = request.object.get("Location");

    //insert code here to check ping location and trigger alerts

    response.success("PONG");
});

//TODO: send sms through twilio

//TODO: panic button 

function getPhonenumberForUser(user) {
    Parse.Cloud.useMasterKey();
    var number = user.get("phonenumber");
}
