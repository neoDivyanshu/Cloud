'use strict';

const yelp = require('yelp-fusion');
const AWS = require("aws-sdk");
const mysql = require('mysql');

const sqs = new AWS.SQS({region : 'us-east-1'});
const queueUrl = "";

const apiKey = '';

exports.handler = (event, context, callback) => {

  var params = {
        MaxNumberOfMessages: 10,
        QueueUrl: queueUrl,
        VisibilityTimeout: 60 // 10 min wait time for anyone else to process.
        //WaitTimeSeconds: 0
    };

  sqs.receiveMessage(params, function(err, data) {
    if(err) {
            //res.send(err);
            console.log(err);
    }
    else {

      var msg = "";
      var recHandle = "";

      data.Messages.forEach(function(key) {

        msg = key.Body;
        recHandle = key.ReceiptHandle;

        var MsgObj = JSON.parse(msg);
        console.log("Term: " +  MsgObj.term);
        const searchRequest = {
          term: MsgObj.term,
          location: MsgObj.location,
          limit: MsgObj.limit
          //open_at:MsgObj.open_at
        };

        const client = yelp.client(apiKey);

        client.search(searchRequest).then(response => {

            const firstResult = response.jsonBody.businesses[0];
            const firstResultJson = JSON.stringify(firstResult, null, 4);
            //console.log(response);

            const secondResult = response.jsonBody.businesses[1];
            const secondResultJson = JSON.stringify(secondResult, null, 4);
            //console.log(secondResultJson);

            const thirdResult = response.jsonBody.businesses[2];
            const thirdResultJson = JSON.stringify(thirdResult, null, 4);
            //console.log(thirdResultJson);

            var obj1 = JSON.parse(firstResultJson);
            var id1 = obj1.id;
            var name1 = obj1.name;
            var url1 = obj1.url;
            var addrObj1 = obj1.location.display_address;
            var addr1 = addrObj1.toString();
            addr1 = addr1.replace(/\[/i, '');
            //console.log(addr1.replace(/\]/i, ''));

            var obj2 = JSON.parse(secondResultJson);
            var id2 = obj2.id;
            var name2 = obj2.name;
            var url2 = obj2.url;
            var addrObj2 = obj2.location.display_address;
            var addr2 = addrObj2.toString();
            addr2 = addr2.replace(/\[/i, '');

            var obj3 = JSON.parse(thirdResultJson);
            var id3 = obj3.id;
            var name3 = obj3.name;
            var url3 = obj3.url;
            var addrObj3 = obj3.location.display_address;
            var addr3 = addrObj3.toString();
            addr3 = addr3.replace(/\[/i, '');

            var str1 = "Suggestion 1\nRestaurant Name:" + name1 + "\nAddress:" + addr1 + "\nPhone:" + obj1.phone + "\nPrice:" + obj1.price;
            var str2 = "Suggestion 2\nRestaurant Name:" + name2 + "\nAddress:" + addr2 + "\nPhone:" + obj2.phone + "\nPrice:" + obj1.price;
            var str3 = "Suggestion 3\nRestaurant Name:" + name3 + "\nAddress:" + addr3 + "\nPhone:" + obj3.phone + "\nPrice:" + obj1.price;

            var str = "Please Find Below Restaurant Suggestions From RestFinder For " + MsgObj.UserID + "\n\r" + str1 + "\n\r" + str2 + "\n\r" + str3;

            console.log(str);
            var pool  = mysql.createPool({
              host     : '',
              user     : '',
              password : '',
              database : ''
            });

            console.log("Entering Pool");

            pool.getConnection(function(error, connection) {
              context.callbackWaitsForEmptyEventLoop = false;
              if(error)
              {
                console.log(error);
              }

              var insertstmt = 'INSERT INTO Rest_suggestions (Rest_id, Rest_name, Img_url, Yelp_url, Rating, Review_count, Coord_lat, Coord_long, Price, Phone_number, userid) values';
              insertstmt = insertstmt + ' ("' + obj1.id + '", "' + obj1.name + '", "' + obj1.image_url + '", "' + obj1.url + '", ' + obj1.rating + ', ' + obj1.review_count + ', ' + obj1.coordinates.latitude + ', ' + obj1.coordinates.longitude + ', "' + obj1.price + '", "' + obj1.phone + '", "' + MsgObj.UserID + '"),';
              insertstmt = insertstmt + ' ("' + obj2.id + '", "' + obj2.name + '", "' + obj2.image_url + '", "' + obj2.url + '", ' + obj2.rating + ', ' + obj2.review_count + ', ' + obj2.coordinates.latitude + ', ' + obj2.coordinates.longitude + ', "' + obj2.price + '", "' + obj2.phone + '", "' + MsgObj.UserID + '"),';
              insertstmt = insertstmt + ' ("' + obj3.id + '", "' + obj3.name + '", "' + obj3.image_url + '", "' + obj3.url + '", ' + obj3.rating + ', ' + obj3.review_count + ', ' + obj3.coordinates.latitude + ', ' + obj3.coordinates.longitude + ', "' + obj3.price + '", "' + obj3.phone + '", "' + MsgObj.UserID + '")';

              console.log();
              connection.query(insertstmt, function (error, results, fields) {
                connection.release();
                if (error) {
                  throw error;
                }
                else {
                  console.log("Success inserting");
                }
              });

              pool.end();
            });

            var sns = new AWS.SNS();
            var params = {
              Message: str,
              Subject: "Restaurant Suggestions From RestFinder",
              PhoneNumber: MsgObj.PhoneNumber
            };

            //console.log(obj1)

            console.log("published: " + recHandle);
            sns.publish(params, function(err, data) {
              if (err) console.log(err, err.stack); // an error occurred
              else     console.log(data);           // successful response
            });

        }).catch(e => {
          console.log(e);
        });

        function deleteMessage(receiptHandle, cb) {
          sqs.deleteMessage({
            ReceiptHandle: receiptHandle,
            QueueUrl: queueUrl
          }, cb);
        }

        deleteMessage(recHandle, callback);
      });
    }
  });
};
