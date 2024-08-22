/*using nodemon so start with npm start. if you don't want to use nodemon 
start with node \index.js. but auto restart with changes will not work */

// importing dependencies or middlewares or modules
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
// importing routes from routes folder .js compulsory for your defined component
import appRoutes from './routes/appRoutes.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
// import MongoStore from 'connect-mongo';
import passport from 'passport';
import './Config/passport.js';
import MongoStore from 'connect-mongo';


// for using .env
import dotenv from 'dotenv';
dotenv.config();
const app = express();
// sent coookie from frontend is parsed here first and used in app.use(session) and cors option credentials
app.use(cookieParser());

/* all app.use are middlewares. when user clicks for this port or whenever over any path user comes to this site the site passes only through index.js. so it should go through all these middlewares. these middleware kept here coz necessary whenever this page is called they have to go through these . e.g. app.use(cookieParser()); middleware The cookie-parser middleware parses the cookies attached to the client request object (req). When a request comes in, cookie-parser reads the cookies from the Cookie header and makes them available in req.cookies. If no cookies are sent with a request, the cookie-parser middleware will simply handle this gracefully without causing any issues. there are middleware that are always neede like cors and some may be needed or not like app.use(session  */
// google auth keep it up here to work
/* The app.use(session({}})) middleware setup is essential for maintaining user sessions in web applications. any cookies generated or one session will get this configuration. so It also  works hand-in-hand with Passport.js (and other authentication mechanisms) to:
Authenticate users: Track user sessions securely using signed cookies.
Store session data: Persist user session information across requests.
Manage session state: Handle session-related operations such as starting, maintaining, and ending sessions.*/ 
app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  /* Session Management: It’s normal for a session cookie to be set even if a user hasn’t logged in. This cookie is used to manage and identify the session throughout the user’s interaction with the application. creates 'connect.sid' stored in cookies. so setting saveUninitialized: true, is ok. no functions inside passport.js in Config are triggered.
Session Data Handling: Although the cookie is created, it doesn’t mean that any sensitive user data is being stored until the user interacts with the application and the session is modified.
Change saveUninitialized Setting:
If you don’t want to create a session cookie for users who haven’t interacted with your application or logged in, set C to false. This way, a session is only created and saved when it contains data or has been modified. */
saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV ==="production", // Set to true in production with HTTPS
    httpOnly: true, // Helps to prevent client-side scripts from accessing the cookie
    sameSite: "None", // Adjust as needed: 'lax', 'strict', or 'none'
    maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day).for jwt set differently.
  },
}));
/*These middleware functions including app.use are used in your main application file (index.js) to initialize Passport.js and handle sessions. through passport code in googleauthController.js and passport.js interact with each other.
passport.initialize() sets up Passport to be used in your application.
passport.session() integrates Passport with session management. It allows Passport to store user information in the session and retrieve it on subsequent requests. */
app.use(passport.initialize());
app.use(passport.session());





app.use(express.json());


// Allow requests from localhost:5173 using for cookies to work
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH'], // Allowed methods
  };
app.use(cors(corsOptions));
/*Multer handles file uploads and stores the files in the specified directory.
express.static makes the files in that directory accessible over HTTP.Access File:
To access the image, you can make a request to http://yourdomain.com/images/filename.jpg.
In summary, including app.use('/images', express.static('uploads/images')); is necessary if you want to allow clients to access and view the uploaded files directly through your server. Without this middleware, uploaded files will be stored on the server, but there won't be a direct way to access them via HTTP requests. */
// use this only in saving image in server not in cloud storage
// app.use('/images', express.static('uploads/images'));


// importing connection string.connection to mongo db atlas
const mongoURI = process.env.MONGO_URI;
// if 
const PORT = process.env.PORT || 4000;
// mongodb connection
mongoose.connect(mongoURI)
.then(() => console.log('mongodb atlas connected'))
.catch(err => console.log(err));


// using imported routes from another folder
// This means any request to the root URL ('/') or any subpath (like '/addproduct') will be handled by the routes defined in appRoutes.js.
// including api good. it distinguishes route from frontend route
  app.use('/', appRoutes);




  /* initiating the server and binding to port */
app.listen(PORT, (error) => {
  if(!error){
      console.log(`Server is running on port ${PORT}`);
  }
    else{
      /*can write ${error} or + error */
      console.log("Error:" + error)
    }  
    });