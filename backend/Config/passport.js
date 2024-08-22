import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-google-oauth2';
import Users from '../models/users.js';

passport.use(new OAuth2Strategy({
    clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    
    scope: ['profile', 'email'],
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    
},

async (accessToken, refreshToken, profile, done) => {

    try {
        // First, find if a user with the same Google ID exists
        let user = await Users.findOne({ googleId: profile.id, authProvider: 'google' });
        
        if (user) {
            // If the user already exists, return the user
            return done(null, user);
                                  } 
             else {
                // If no user exists, create a new one
                const newUser = new Users({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    photo: profile.photos[0].value,
                    authProvider: 'google',
                });
                await newUser.save();
                done(null, newUser);
            }
        }
     catch (error) {
        done(error);
    }
}));
passport.serializeUser((user, done) => {
    
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    
    try {
        const user = await Users.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});


export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleAuthCallback = passport.authenticate('google', {
            successRedirect: (`${process.env.FRONTEND_URL}/google-login-success`),
            failureRedirect: (`${process.env.FRONTEND_URL}/login)`)
        });


export const userInfo = (req, res) => {
    
    const { password, ...sanitizedUser } = req.user.toObject();
    if(req.user) {
        
        res.status(200).json({success: true, message: "successfully logged in", user: sanitizedUser})
    }
    else {
        res.status(400).json({success: false, message: "Not Authorized"})
    }
}



export const googleLogout = (req, res, next) => {
    
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log out' });
      }
  
      req.session = null;
      res.clearCookie('connect.sid');
      res.send({
        success: true,
        isAuth: req.isAuthenticated()
      })})}

  

export default passport;