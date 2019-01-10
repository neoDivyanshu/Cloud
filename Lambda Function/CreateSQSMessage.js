var QUEUE_URL = '';
var AWS = require('aws-sdk');
var sqs = new AWS.SQS({region : 'us-east-1'});
var message = '';

function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}

function dispatch(intentRequest, callback) {
    console.log(`request received for userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);
    const sessionAttributes = intentRequest.sessionAttributes;
    const slots = intentRequest.currentIntent.slots;
    const UserID = intentRequest.userId;
    const City = slots.City;
    const Area = slots.Area;
    const Cuisine = slots.Cuisine;
    const DiningDate = slots.DiningDate;
    const DiningTime = slots.DiningTime;
    const NoOfPeople = slots.NoOfPeople;
    const PhoneNumber = slots.PhoneNumber;
    const dineTime = DiningDate + " " + DiningTime;
    dineTime = dineTime.replace('-','/');
    var dineDateTime = new Date(dineTime);
    //console.log(dineDateTime);
    dineDateTime = Math.round(dineDateTime.getTime()/1000);

    message = "{ UserID: '" + UserID + "', " + "term: '" + Cuisine + "', " + "location: '" + Area + ", " + City + "', " + "open_at: '" + dineDateTime + "'," + "PhoneNumber: '" + PhoneNumber + "', limit: 3}";
    console.log(message);

    var params = {
        //MessageBody: JSON.stringify("Hello"),
        MessageBody: JSON.stringify(eval("(" + message + ")")),
        QueueUrl: QUEUE_URL
    };

    sqs.sendMessage(params, function(err,data){
        if(err) {
            console.log('error:',"Fail Send Message- " + err);
        }else{
            console.log('data:',data.MessageId);
        }
    });

    callback(close(sessionAttributes, 'Fulfilled',
    {'contentType': 'PlainText', 'content': `You will get an SMS on phone number ${PhoneNumber}`}));

}


exports.handler = (event, context, callback) => {
    try {
        dispatch(event,
            (response) => {
                callback(null, response);
            });
    } catch (err) {
        callback(err);
    }
};
