**To run function:**  
1. Please make sure axios, prompt, mocha, and chai are installed (otherwise run `npm install ...`).
2. From the upstreet folder, type in the terminal `npm run kyc`.
3. If that doesn't work, type `node -e 'require("./app/upstreet").run()'`.
  
  The program will ask for user inputs for date of birth, first name, middle name (optional), last name,
  licence number, state and expiry date (optional) one by one.
  If you don't want to input a value for an optional field, just press space to proceed to the next input field.
  There is no need to type "" or '' to indicate strings for input fields, the program automatically reads all inputs as strings.
  Errors and kycResults will be logged on the terminal console.

**To run tests:**
1. Please make sure axios, prompt, mocha, and chai are installed (otherwise run `npm install ...`).
2. From the upstreet folder, type in the terminal `npm run test`.
