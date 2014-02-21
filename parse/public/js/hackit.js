
var User = Parse.Object.extend("User");
var query = new Parse.Query(User);
query.get("BBBRCdOfJQ", {
  success: function(user) {
    // The object was retrieved successfully.
    console.log("retreived successfully");
    var test = (user.get('outOfBounds'));
    console.log(test);
    if (test === true)
    {
    changeStatusToWarn();
    }
    else
    {
    changeStatusToSafe();
    }
  },
  error: function(object, error) {
    // The object was not retrieved successfully.
    // error is a Parse.Error with an error code and description.
    
    console.log(Parse.Error);
  }
});

var changeStatusToWarn = function() {
	
	$("#safeOrWarn").attr("src","img/warning.png");
  }

var changeStatusToSafe = function() {
	
	$("#safeOrWarn").attr("src","img/safe.png");
  }


