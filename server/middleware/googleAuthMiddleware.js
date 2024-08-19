/* req.isAuthenticated() and req.user methods are availablecoz of passport. These are provided by Passport.js, so your middleware must be used in a context where Passport.js has been properly set up. no need to import it in same app*/


export const googleAuthMiddleware = (req, res, next) => {
    console.log("googleauthmiddleware hit");
    /*Purpose: req.user holds the authenticated user’s information. This data is made available after the user has been authenticated by Passport and the authentication process has completed successfully.
Source: Passport.js populates req.user with user data during the authentication process. This happens as part of the session management that Passport performs, particularly in the deserializeUser function. 
req.isAuthenticated() is a method provided by Passport.js that returns a boolean value indicating whether the user is currently authenticated.*/
    if (req.isAuthenticated() && req.user) {
        // User is authenticated with Google
        return next();
    } else {
/* return res.status(401).json({ success: false, message: "unauthorized" }); not using this error handling cause if we are using jwt login googleAuthMiddleware will throw error and bcoz of this error returns and process stops here and authenticateToken in eitherAuthMiddleware won't run. so even if error we are returning next. this process will only be used where eitherAuthMiddleware is used so if error in eitherAuthMiddleware it is handled there and if eitherAuthMiddleware is not used for auth error handling is done in respective login controllers*/
        return next();
    }
};