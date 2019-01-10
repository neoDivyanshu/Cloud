'use strict';

const yelp = require('yelp-fusion');
const AWS = require("aws-sdk");

const apiKey = '';

exports.handler = (event, context, callback) => {
  const searchRequest = {
    term: '',
    location: 'United States',
    sort_by: 'review_count'
  };

  const client = yelp.client(apiKey);

  client.search(searchRequest).then(response => {
    const Result1 = response.jsonBody.businesses[0];
    const Result1Json = JSON.stringify(Result1, null, 4);
    var obj1 = JSON.parse(Result1Json);
    //console.log(obj1);

  	const Result2 = response.jsonBody.businesses[1];
    const Result2Json = JSON.stringify(Result2, null, 4);
    var obj2 = JSON.parse(Result2Json);
    //console.log(obj2);

	  const Result3 = response.jsonBody.businesses[2];
    const Result3Json = JSON.stringify(Result3, null, 4);
    var obj3 = JSON.parse(Result3Json);
    //console.log(obj3);

    var result = '{"restaurants": [';
    result = result + '{"Img_url": "' + obj1.image_url + '", "Rest_name": "' + obj1.name + '", "Rating": ' + obj1.rating + ', "Review_count": ' + obj1.review_count + ', "Price": "' + obj1.price + '", "Phone_number": "' + obj1.phone + '"}';
    result = result + ", " + '{"Img_url": "' + obj2.image_url + '", "Rest_name": "' + obj2.name + '", "Rating": ' + obj2.rating + ', "Review_count": ' + obj2.review_count + ', "Price": "' + obj2.price + '", "Phone_number": "' + obj2.phone + '"}';
    result = result + ", " + '{"Img_url": "' + obj3.image_url + '", "Rest_name": "' + obj3.name + '", "Rating": ' + obj3.rating + ', "Review_count": ' + obj3.review_count + ', "Price": "' + obj3.price + '", "Phone_number": "' + obj3.phone + '"}';
    result = result + "]}";
    console.log(result);

    callback(null, result);
  });
}
