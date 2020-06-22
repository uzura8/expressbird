'use strict';

exports.handler = function(event, context, callback) {
  console.log(JSON.stringify(event));
  var message = 'Hello World!';

  var getAnserBySupportNumber = function(supportNum) {
    console.log(supportNum)
    switch (supportNum) {
      case '1':
        return 'http://example.com/about みてね。';
      case '2':
        return 'http://example.com/adress みてね。';
      case '3':
        return '100万円です';
      case '4':
        return 'オペレーターを呼び出してます。ちょっとまってね。';
      default:
        return 'Support number is not correct. Please say again.';
    }
  }

  var response = {
    sessionAttributes: event.sessionAttributes,
    dialogAction: {
      type: 'Close',
      fulfillmentState: 'Fulfilled',
      message: {
        contentType: 'PlainText',
        content: message
      }
    }
  };
  
  switch(event.currentIntent.name) {
    case "FirstSupport":
      response.dialogAction.fulfillmentState = "Fulfilled";
      response.dialogAction.message.content = getAnserBySupportNumber(event.currentIntent.slots.SelectNum);
      break;

    default:
      response.dialogAction.fulfillmentState = "Failed";
      response.dialogAction.message.content = "I don't know what you're asking...";
      break;
  }

  callback(null, response);
};

