import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Middleware to verify JWT token
/* auth cycle 3: only checks if token is valid or not doesnot care about role goes to authorizeAdmin or authorizeUser as requested */ 
const authenticateToken = (req, res, next) => {
    console.log("authenticate token hit");
    const accessToken = req.cookies.accessToken;
    /* if used const authHeader = req.headers['authorization']; for then const token = authHeader && authHeader.split(' ')[1]; for acessing acessToken */
    if (!accessToken) {
    return res.status(401).json({ success: false, message: "unauthorized" });
    }
    /* If the token is valid, the decoded token payload is passed to the callback function along with process.env.ACCESS_TOKEN_SECRET n  user.accesstoken is here until app refreshed so can be verified. jwt is stateless coz data or payload is saved in cokkies along with signature which verifies cookies.whereas sessin saves payload in server by which it verifies incoming cookies*/
    /* jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => { ... });
jwt.verify() is used to verify the accessToken against process.env.ACCESS_TOKEN_SECRET, which should be the same secret used to sign the token during its creation.
It asynchronously verifies the token's signature and decodes its payload.
The callback function (err, user) is executed after verification:*/
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "insufficient permission" });
        }
        /* extract user data from the token. data is passed from authController along with token*/
        req.user = user; 
        next();
    });
};


// Middleware to check for admin role
// auth cycle 4: checks if data which is passed by cycle 2 contains role of admin or not, cycle ends 
const authorizeAdmin = (req, res, next) => {
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
};

// Middleware to check for user role
// auth cycle 4: checks if data which is passed by cycle 2 contains role of user or not, cycle ends
const authorizeUser = (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
};

export { authenticateToken, authorizeAdmin, authorizeUser };