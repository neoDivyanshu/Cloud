// ---------------- Helper Functions --------------------------------------------------

function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
        },
    };
}

function delegate(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}

function parseLocalDate(date) {
    /**
     * Construct a date object in the local timezone by parsing the input date string, assuming a YYYY-MM-DD format.
     * Note that the Date(dateString) constructor is explicitly avoided as it may implicitly assume a UTC timezone.
     */
    const dateComponents = date.split(/\-/);
    return new Date(dateComponents[0], dateComponents[1] - 1, dateComponents[2]);
}

function isValidDate(date) {
    try {
        return !(isNaN(parseLocalDate(date).getTime()));
    } catch (err) {
        return false;
    }
}

function buildValidationResult(isValid, violatedSlot, messageContent) {
    if (messageContent == null) {
        return {
            isValid,
            violatedSlot,
        };
    }
    return {
        isValid,
        violatedSlot,
        message: { contentType: 'PlainText', content: messageContent },
    };
}

function isValidCity(city) {
    //const validCities = ['new york', 'los angeles', 'chicago', 'houston', 'philadelphia', 'phoenix', 'san antonio', 'san diego', 'dallas', 'san jose',
    //    'austin', 'jacksonville', 'san francisco', 'indianapolis', 'columbus', 'fort worth', 'charlotte', 'detroit', 'el paso', 'seattle', 'denver', 'washington dc',
    //    'memphis', 'boston', 'nashville', 'baltimore', 'portland', 'brooklyn', 'bronx', 'queens', 'staten island', 'jersy city'];
    const validCities = ['new york','los angeles','chicago','houston','phoenix','philadelphia','san antonio','san diego','dallas','san jose','detroit','jacksonville','indianapolis','san francisco','columbus','austin','memphis','fort worth','baltimore','charlotte','el paso','boston','seattle','washington','milwaukee','denver','louisville/jefferson county','las vegas','nashville-davidson','oklahoma city','portland','tucson','albuquerque','atlanta','long beach','fresno','sacramento','mesa','kansas city','cleveland','virginia beach','omaha','miami','oakland','tulsa','honolulu','minneapolis','colorado springs','arlington','wichita','raleigh','st. louis','santa ana','anaheim','tampa','cincinnati','pittsburgh','bakersfield','aurora','toledo','riverside','stockton','corpus christi','newark','anchorage','buffalo','st. paul','lexington-fayette','plano','fort wayne','st. petersburg','glendale','jersey city','lincoln','henderson','chandler','greensboro','scottsdale','baton rouge','birmingham','norfolk','madison','new orleans','chesapeake','orlando','garland','hialeah','laredo','chula vista','lubbock','reno','akron','durham','rochester','modesto','montgomery','fremont','shreveport','arlington','glendale'];
    return (validCities.indexOf(city.toLowerCase()) > -1);
}

function validateOrderDining(cuisine, date, time, city) {
    console.log('in validation');
    const cuisineList = ['italian', 'indian', 'pakistani', 'chinese', 'mexican', 'american', 'australian', 'japanese', 'mid eastern',
        'middle eastern', 'french', 'mediterranean', 'english', 'thai', 'spanish', 'continental', 'asian', 'vietnamese', 'portuguese', 'greek', 'korean', 'german', 'turkish', 'european', 'african', 'british', 'caribbean', 'peruvian', 'filipino', 'lebanese'];

    if (cuisine && cuisineList.indexOf(cuisine.toLowerCase()) === -1) {
        return buildValidationResult(false, 'Cuisine', `We do not have ${cuisine}`);
    }

    if (date) {
        if (!isValidDate(date)) {
            return buildValidationResult(false, 'DiningDate', 'I did not understand that, what date would you like to dine in?');
        }
        if (parseLocalDate(date) < new Date().getDate()) {
            return buildValidationResult(false, 'DiningDate', 'Your date must be a future date. What day would you like to dine in?');
        }
    }

    if (time) {
        if (time.length !== 5) {

            return buildValidationResult(false, 'DiningTime', null);
        }
        const hour = parseInt(time.substring(0, 2), 10);
        const minute = parseInt(time.substring(3), 10);
        if (isNaN(hour) || isNaN(minute)) {

            return buildValidationResult(false, 'DiningTime', null);
        }
    }

    if (city && !isValidCity(city)) {
        return buildValidationResult(false, 'City', `We currently do not support ${city}`);
    }

    return buildValidationResult(true, null, null);
}


function dispatch(intentRequest, callback) {
    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

    const intentName = intentRequest.currentIntent.name;

    // Dispatch to your skill's intent handlers

    return orderDining(intentRequest, callback);

}


function orderDining(intentRequest, callback) {

    const name = intentRequest.currentIntent.name;
    const sessionAttributes = intentRequest.sessionAttributes;
    const slots = intentRequest.currentIntent.slots;
    const City = slots.City;
    const Area = slots.Area;
    const Cuisine = slots.Cuisine;
    const DiningDate = slots.DiningDate;
    const DiningTime = slots.DiningTime;
    const NoOfPeople = slots.NoOfPeople;
    const PhoneNumber = slots.PhoneNumber;


    // Perform basic validation on the supplied input slots.  Use the elicitSlot dialog action to re-prompt for the first violation detected.

    const validationResult = validateOrderDining(Cuisine, DiningDate, DiningTime, City);
    if (!validationResult.isValid) {
        slots[`${validationResult.violatedSlot}`] = null;
        callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
        return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;

}

exports.handler = (event, context, callback) => {

    process.env.TZ = 'America/New_York';
    console.log(`event.bot.name=${event.bot.name}`);

    dispatch(event, (response) => callback(null, response));

};
