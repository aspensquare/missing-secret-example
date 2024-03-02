const jwt = require( "jsonwebtoken" );
const fs = require( "fs" );
const path = require( "path" );

const teamId = "Q95N99Y56D"; // Replace with your actual team ID
const bundleId = "com.aspensquare.portal"; // Replace with your actual bundle or Services ID
const keyId = "NM99MZ25B9"; // Replace with your actual key ID
const keyFilePath = "private/key/AuthKey_NM99MZ25B9.p8"; // Replace with the path to your downloaded key file

// Generate the JWT header
const header = {
    alg: "ES256",
    kid: keyId,
};

// Generate the JWT payload
const payload = {
    iss: teamId,
    iat: Math.floor( Date.now() / 1000 ), // Current time in seconds
    exp: Math.floor( Date.now() / 1000 ) + 180 * 24 * 60 * 60, // Expiration time (180 days)
    aud: "https://appleid.apple.com",
    sub: bundleId,
};

// Load the private key from the downloaded key file
const privateKey = fs.readFileSync( path.resolve( __dirname, keyFilePath ), "utf-8" );

// Generate the client secret
const clientSecret = jwt.sign( payload, privateKey, { algorithm: "ES256", header } );

console.log( clientSecret );
