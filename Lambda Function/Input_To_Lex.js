'use strict';
var AWS = require('aws-sdk');
var mysql = require('mysql');

//var userexists = 0;


exports.handler = (event, context, callback) => {

	AWS.config.region = 'us-east-1'; // Region

	var lexruntime = new AWS.LexRuntime();
	//var lexUserId = 'RestFinder_';// + Date.now();   //add here
	var sessionAttributes = {};

	// send it to the Lex runtime
	var params = {
		botAlias: '$LATEST',
		botName: '',
		inputText: event.key,
		userId: event.UserName,
		sessionAttributes: sessionAttributes
	};

	lexruntime.postText(params, function(err, data) {
		if (err) {
			console.log(err, err.stack);
			//throw err;
		}
		if (data) {
			// capture the sessionAttributes for the next cycle
			sessionAttributes = data.sessionAttributes;
			// show response and/or error/dialog status
			console.log(data);
			callback(null, data.message);
		}
		// re-enable input
	});

  var pool  = mysql.createPool({
  host     : '',
  user     : '',
  password : '',
  database : ''
  });

  pool.getConnection(function(error, connection) {
    // Use the connection
    context.callbackWaitsForEmptyEventLoop = false;
    connection.query('SELECT userid, uemail FROM usertab where userid = \'' + event.UserName + '\'', function (error, results, fields) {
      connection.release();
      if (error) {
        //callback(error);
        throw error;
        //pool.end();
      }
      else {
        if(results[0]){
          console.log("User already exists");
          console.log(results[0].userid);
          console.log(results[0].uemail);
          pool.end();
        }
        else {
          context.callbackWaitsForEmptyEventLoop = false;
          console.log("User does not exists");
          var insertstmt = "INSERT INTO usertab values ('" + event.UserName + "', '" + event.uemail + "')";
          connection.query(insertstmt, function (err, results){
            connection.release();
            if(err){
              //console.log("Insert Query" + err);
              throw err;
            }
            else {
              console.log("New record added");
            }
          });
          pool.end();
        }
      // Don't use the connection here, it has been returned to the pool.
      }
    //pool.end();
    });
  });
};
