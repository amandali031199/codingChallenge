var _this = this;
const axios = require('axios')
const { VerifyDocumentError, InputError } = require('./errors');
var resultTrue = {"kycResult": true};
var resultFalse = {"kycResult": false};

const prompt = require('prompt');

//main function, includes asking for user input
exports.run = function () {
  prompt.start();

  prompt.get(['date of birth', 'first name', 'middle name (optional)', 'last name',
  'licence number', 'state', 'expiry date (optional)'], function (err, result) {
    if (err) {
      return onErr(err);
    }
    exports.checkLicence(result['date of birth'], result['first name'],
      result['middle name (optional)'], result['last name'], result['licence number'],
      result.state, result['expiry date (optional)']);
  });
}

function onErr(err) {
    console.log(err);
    return 1;
}

//validate inputs (some are required some aren't)
exports.validateInputs = function(dob, firstName, middleName, lastName,
  licence, state, expiry) {

  if (!this.isValidDate(dob)) {
    throw new InputError("Please provide a valid date of birth in the " +
    "format YYYY-MM-DD");
  }
  if (firstName.length <= 0) {
    throw new InputError("A valid first name that's no more than 100 " +
    "characters is required and cannot be left blank");
  }
  if (firstName.length > 100) {
    throw new InputError("Please provide a valid first name that's no " +
    "more than 100 characters");
  }
  if (middleName.length > 100) {
    throw new InputError("Please provide a valid middle name that's no " +
    "more than 100 characters, otherwise leave blank");
  }
  if (lastName.length <= 0) {
    throw new InputError("A valid last name that's no more than 100 " +
    "characters is required and cannot be left blank");
  }
  if (lastName.length > 100) {
    throw new InputError("Please provide a valid last name that's no more" +
    " than 100 characters");
  }
  if (licence == "") {
    throw new InputError("Please provide a valid licence number");
  }
  if (state != "NSW" && state != "QLD" && state != "SA" && state != "TAS" &&
  state != "VIC" && state != "WA" && state != "ACT" && state != "NT") {
     throw new InputError("Please provide a valid state that is either NSW, " +
     "QLD, SA, TAS, VIC, WA, ACT or NT");
  }
  if (expiry != "" && !this.isValidDate(expiry)) {
    throw new InputError("Please provide a valid expiry date in the format" +
    " YYYY-MM-DD, otherwise leave blank");
  }
  return "Valid"
};

// run validation and posting to API
exports.checkLicence = function(dob, firstName, middleName, lastName, licence,
  state, expiry) {
  //will throw an error and stop function if input is invalid
  this.validateInputs(dob, firstName, middleName, lastName, licence, state, expiry);

  //post to api
  axios({
    method: 'post',
    url: "https://australia-southeast1-reporting-290bc.cloudfunctions.net/driverlicence",
    headers: {
      'Authorization' : 'Bearer ' +
      '03aa7ba718da920e0ea362c876505c6df32197940669c5b150711b03650a78cf',
      'Content-Type' : 'application/json'
    },
    data: {
      birthDate : dob,
      givenName : firstName,
      middleName : middleName,
      familyName : lastName,
      licenceNumber : licence,
      stateOfIssue : state,
      expiryDate : expiry
    }
  }).then(response => {
  //handle errors
    exports.handleReturn(response.data.verificationResultCode);
    // checkLicence can't directly return response (as it is inside a promise)
    // (can only be used in callbacks) so I just console.log
  }).catch(err => {
    console.log("error in request", err);
  });
};

// interpret api results to errors and return values
exports.handleReturn= function (code) {
  if (code == 'S') {
    throw new VerifyDocumentError("An error with the server occured", 'S');
  } else if (code == 'D') {
    throw new VerifyDocumentError("An error with the document occured", 'D');
  } else if (code == 'Y') {
    console.log(resultTrue);
    return resultTrue;
  } else if (code == 'N') {
    console.log(resultFalse);
    return resultFalse;
  } else {
    throw new Error("Verification Result Code is neither 'S', 'D','N' or 'Y'");
  }
};

//determine if a date is valid
exports.isValidDate = function (dateString) {
  // First check for the pattern
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dateString))
    return false;

  // Parse the date parts to integers
  var parts = dateString.split("-");
  var day = parseInt(parts[2], 10);
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[0], 10);

  // Check the ranges of month and year
  if(year < 1000 || year > 3000 || month == 0 || month > 12)
    return false;

  var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

  // Adjust for leap years
  if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
    monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
};
