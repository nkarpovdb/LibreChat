const passport = require('passport');
const CustomStrategy = require('passport-custom').Strategy;
const jwt = require('jsonwebtoken'); // Optional, only if you need to decode the token
const User = require('../models/User');
const logger = require('../utils/logger');


const jwtDatabricks = () =>
    new CustomStrategy(
        async function (req, done) {
            // Extract the JWT from the cookie
            let token = null;
            if (req && req.cookies) {
                token = req.cookies['ws_id_token'];
            }

            if (!token) {
                return done(null, false, { message: 'No token provided' });
            }

            // Optional: Decode the token if you need to extract user info from it
            let decodedToken;
            try {
                decodedToken = jwt.decode(token); // Note: This does not verify the token
            } catch (err) {
                return done(err);
            }

            // Use the decoded token for user info
            const userInfo = decodedToken; // Or extract specific fields from decodedToken
            
            try {
                let user = await User.findOne({ email: userInfo.email });

                if(!user) {
                    // Create a new user instance
                    user = new User({
                        email: userInfo.email,
                        name: userInfo.name,
                    });
                
                    // Save the user to the database
                    await user.save();
                }

                done(null, user);
            } catch (err) {
                done(err, false);
            }
        }
    )

module.exports = jwtDatabricks;