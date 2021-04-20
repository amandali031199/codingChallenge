var expect = require("chai").expect;
var upstreet = require("../app/upstreet");
const { VerifyDocumentError, InputError } = require('../app/errors');
var resultTrue = {"kycResult": true};
var resultFalse = {"kycResult": false};
const axios = require('axios')

// will always be passing string in (feature of node.js prompt)
// returns true or false
describe("Validating dates", function() {
  it("when format isnt yyyy-mm-dd", function() {
    var wrongOrder = upstreet.isValidDate("01-01-2000")
    expect(wrongOrder).to.equal(false);
    var format = upstreet.isValidDate("01012000")
    expect(format).to.equal(false);
    var missing = upstreet.isValidDate("01-1-2000")
    expect(missing).to.equal(false);
  });
  it("invalid year", function() {
    var year = upstreet.isValidDate("4312-01-01")
    expect(year).to.equal(false);
  });
  it("invalid month", function() {
    var month = upstreet.isValidDate("2000-13-01")
    expect(month).to.equal(false);
  });
  it("invalid date", function() {
    var date = upstreet.isValidDate("2000-11-31")
    expect(date).to.equal(false);
    var feb = upstreet.isValidDate("2001-02-29")
    expect(feb).to.equal(false);
  });
  it("leap year", function() {
    var leap1 = upstreet.isValidDate("2000-02-29")
    expect(leap1).to.equal(true);
  });
  it("valid format", function() {
    var valid = upstreet.isValidDate("2000-03-15")
    expect(valid).to.equal(true);
  });
});

// testing all other inputs & if required or optional
// will always be strings (property of node.js prompt)
describe("Validating inputs", function() {
  it("invalid dob", function() {
    expect(function() {
      upstreet.validateInputs("2001-02-29", "", "", "", "", "", "");
    }).to.throw(InputError,
      "Please provide a valid date of birth in the format YYYY-MM-DD");
  });
  it("missing dob", function() {
    expect(function() {
      upstreet.validateInputs("", "", "", "", "", "", "");
    }).to.throw(InputError,
      "Please provide a valid date of birth in the format YYYY-MM-DD");
  });
  it("missing first name", function() {
    expect(function() {
      upstreet.validateInputs("2001-02-26", "", "", "", "", "", "");
    }).to.throw(InputError,
      "A valid first name that's no more than 100 characters is required" +
      " and cannot be left blank");
  });
  it("too long first name", function() {
    expect(function() {
      upstreet.validateInputs("2001-02-26",
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "", "", "", "", "");
    }).to.throw(InputError,
      "Please provide a valid first name that's no more than 100 characters");
  });
  it("100 character first name", function() {
    var result = upstreet.validateInputs("2001-02-26",
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "", "A", "123", "NSW", "");
    expect(result).to.equal("Valid");
  });
  it("optional middle name", function() {
    var result = upstreet.validateInputs("2001-02-26",
    "A", "", "A", "123", "NSW", "");
    expect(result).to.equal("Valid");
  });
  it("too long middle name", function() {
    expect(function() {
      upstreet.validateInputs("2001-02-26",
      "A", "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "", "", "", "");
    }).to.throw(InputError,
      "Please provide a valid middle name that's no more than 100 characters," +
      " otherwise leave blank");
  });
  it("100 character middle name", function() {
    var result = upstreet.validateInputs("2001-02-26",
    "A", "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "A", "123", "NSW", "");
    expect(result).to.equal("Valid");
  });
  it("missing last name", function() {
    expect(function() {
      upstreet.validateInputs("2001-02-26", "A", "", "", "", "", "");
    }).to.throw(InputError, "A valid last name that's no more " +
    "than 100 characters is required and cannot be left blank");
  });
  it("too long last name", function() {
    expect(function() {
      upstreet.validateInputs("2001-02-26",
      "A", "", "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "", "", "");
    }).to.throw(InputError,
      "Please provide a valid last name that's no more than 100 characters");
  });
  it("100 character last name", function() {
    var result = upstreet.validateInputs("2001-02-26",
    "A", "", "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "123", "NSW", "");
    expect(result).to.equal("Valid");
  });
  it("missing licence number", function() {
    expect(function() {
      upstreet.validateInputs("2001-02-26",
      "A", "", "AAA", "", "", "");
    }).to.throw(InputError, "Please provide a valid licence number");
  });
  it("missing state", function() {
    expect(function() {
      upstreet.validateInputs("2001-02-26",
      "A", "", "AAA", "123", "", "");
    }).to.throw(InputError,
      "Please provide a valid state that is either NSW, " +
      "QLD, SA, TAS, VIC, WA, ACT or NT");
  });
  it("invalid state", function() {
    expect(function() {
      upstreet.validateInputs("2001-02-26",
      "A", "", "AAA", "123", "A", "");
    }).to.throw(InputError,
      "Please provide a valid state that is either NSW, QLD, SA," +
      " TAS, VIC, WA, ACT or NT");
  });
  it("optional expiry date", function() {
    var result = upstreet.validateInputs("2001-02-26",
    "A", "A", "A", "123", "NSW", "");
    expect(result).to.equal("Valid");
  });
  it("invalid expiry date", function() {
    expect(function() {
      upstreet.validateInputs("2001-01-29", "A", "", "A",
      "123", "QLD", "2001-13-12");
    }).to.throw(InputError,
      "Please provide a valid expiry date in the format YYYY-MM-DD," +
      " otherwise leave blank");
  });
});

// testing return values from API
// since KYC result is random, it's hard to test posting to API and seeing
// what result we should get
// so test conditionals when converting result and throwing errors
describe("Interpreting results from API", function() {
  it("server error", function() {
    expect(function() {
      upstreet.handleReturn('S');
    }).to.throw(VerifyDocumentError, "An error with the server occured");
  });
  it("document error", function() {
    expect(function() {
      upstreet.handleReturn('D');
    }).to.throw(VerifyDocumentError, "An error with the document occured");
  });
  it("returned N", function() {
    var result = upstreet.handleReturn('N');
    expect(JSON.stringify(result)).to.equal(JSON.stringify(resultFalse));
  });
  it("returned Y", function() {
    var result = upstreet.handleReturn('Y');
    expect(JSON.stringify(result)).to.equal(JSON.stringify(resultTrue));
  });
  it("unknown code", function() {
    expect(function() {
      upstreet.handleReturn('A');
    }).to.throw(Error, "Verification Result Code is neither 'S', 'D','N' or 'Y'");
  });
});

//testing connection to API is OK
describe("Connection to API", function() {
  it("status 200", function() {
    axios({
      method: 'post',
      url: "https://australia-southeast1-reporting-290bc.cloudfunctions.net/driverlicence",
      headers: {
        'Authorization' : 'Bearer ' +
          '03aa7ba718da920e0ea362c876505c6df32197940669c5b150711b03650a78cf',
        'Content-Type' : 'application/json'
      },
      data: {
        birthDate : "2020-01-01",
        givenName : "A",
        middleName : "",
        familyName : "A",
        licenceNumber : "123",
        stateOfIssue : "NSW",
        expiryDate : ""
      }
    }).then(response => {
      expect(response).to.have.status(200);
    });
  });
});
