/*using nodemon so start with npm start. if you don't want to use nodemon 
start with node \index.js. but auto restart with changes will not work */

// importing dependencies or middlewares or modules
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
// importing routes from routes folder .js compulsory for your defined component
import appRoutes from "./routes/appRoutes.js";
import cookieParser from "cookie-parser";
import session from "express-session";
// import MongoStore from 'connect-mongo';
import passport from "passport";
import "./Config/passport.js";
import MongoStore from "connect-mongo";
// for using .env
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.set("trust proxy", 1); // Trust first proxy (e.g., Render's proxy)

/* all app.use are middlewares. when user clicks for this port or whenever over any path user comes to this site the site passes only through index.js. so it should go through all these middlewares. these middleware kept here coz necessary whenever this page is called they have to go through these . e.g. app.use(cookieParser()); middleware The cookie-parser middleware parses the cookies attached to the client request object (req). When a request comes in, cookie-parser reads the cookies from the Cookie header and makes them available in req.cookies. If no cookies are sent with a request, the cookie-parser middleware will simply handle this gracefully without causing any issues. there are middleware that are always needed like cors and some may be needed or not like app.use(session  */
/* The app.use(session({}})) only coz google auth using passport.js needs this. we are using jwt auth and jwt is good than session based auth coz jwt is stateless meaning doesnot use memory in server which is limited. express session is stateful and uses server memory. here passport needs session so using it. session ia auth like jwt we can have own session auth too but jwt is preferred coz of stateless. here session data saved in database n compare cookie n in every request database query not good. but to make user not login again after acess token expires which is short lived we use refresh token which has long life and is seaved in database. yes refresh is session coz caved in db but we don't make it use often only acess token is used in every request and refresh only after long time so no problem.*/

/* when user log in cookie is send from server both in jwt and session along with cookie characters like httpOnly: true and browser then sets cookies by setCookie if characters matched. cg=haracter for twt and session and whole auth system is different. only i am refrerring process of how cookies are set. */
app.use(
  session({
    /*.this step is started after serializeUser gets data. When a session is created, the express-session middleware generates a session ID. This session ID is then sent to the client as a cookie (often named connect.sid).
The secret is used to create a signature for this session ID cookie. The signature is a cryptographic hash of the session ID and the secret, ensuring that the cookie cannot be altered without detection.When a client sends the session cookie back to the server in subsequent requests, the server uses the secret to validate the signature of the cookie. */
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    /* Session Management: It’s normal for a session cookie to be set even if a user hasn’t logged in. This cookie is used to manage and identify the session throughout the user’s interaction with the application. creates 'connect.sid' stored in cookies. so setting saveUninitialized: true, is ok. no functions inside passport.js in Config are triggered.
Session Data Handling: Although the cookie is created, it doesn’t mean that any sensitive user data is being stored until the user interacts with the application and the session is modified.
Change saveUninitialized Setting:
If you don’t want to create a session cookie for users who haven’t interacted with your application or logged in, set C to false. This way, a session is only created and saved when it contains data or has been modified. */
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",//Set to true automatically whenin .env set to production with HTTPS
      httpOnly: true, // Helps to prevent client-side scripts from accessing the cookie
      sameSite: "None", // Adjust as needed: 'lax', 'strict', or 'none'
      path: "/",
      maxAge: 3 * 60 * 60 * 1000, // Cookie expiration time (3 hour).for jwt set differently.
      autoRemove: "native", // Automatically remove expired sessions from database
    },
  })
);
/*These middleware functions including app.use are used in your main application file (index.js) to initialize Passport.js and handle sessions. through passport code in googleauthController.js and passport.js interact with each other.
passport.initialize() sets up Passport to be used in your application.
passport.session() integrates Passport with session management. It allows Passport to store user information in the session and retrieve it on subsequent requests. */
app.use(passport.initialize());
app.use(passport.session());

/*sent coookie from frontend is parsed here first and used in jwt. session doesnot need this but jwt does so compulsory to use it. cookie attributes like cookie: {
  secure: process.env.NODE_ENV === 'production',  // Set to true in production with HTTPS
    httpOnly: true, // Helps to prevent client-side scripts from accessing the cookie
    sameSite: "None", // Adjust as needed: 'lax', 'strict', or 'none'
    maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day).for jwt set differently.
  }, in jwt in authControllers are totally independent of from session cookie attributes. Parsing Cookies: When a client makes a request to your server, it can include cookies in the HTTP request headers. The cookie parser middleware extracts these cookies and makes them available in a structured format (req.cookies provides a JavaScript object where you can access each cookie by its name.).

Making Cookies Available: After parsing the cookies, the middleware attaches them to the req object, typically under req.cookies. This makes it easy for your route handlers to access and work with the cookies.

Handling Cookie Attributes: The parser can also handle cookie attributes like httpOnly, secure, maxAge, etc., but primarily it focuses on reading the cookies. */
app.use(cookieParser());
app.use(express.json());

// Allow requests from localhost:5173 using for cookies to work
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"], // Allowed methods
};
app.use(cors(corsOptions));

/*Multer handles file uploads and stores the files in the specified directory.
express.static makes the files in that directory accessible over HTTP.Access File:
To access the image, you can make a request to http://yourdomain.com/images/filename.jpg.
In summary, including app.use('/images', express.static('uploads/images')); is necessary if you want to allow clients to access and view the uploaded files directly through your server. Without this middleware, uploaded files will be stored on the server, but there won't be a direct way to access them via HTTP requests. if we use static means html in express we have to use xpress.static. For example, if you have an image named photo.jpg in the uploads/images directory, it will be accessible at http://yourdomain.com/images/photo.jpg. it serves static assets from backend and frontend directory. Unchanging Content: The content of static files does not change based on user interaction or server-side processing. They are served exactly as they are stored on the server.

Direct Access: Static files can be accessed directly via URLs, and their content is delivered to the client without the need for server-side logic or dynamic generation.
No Server-Side Processing: Unlike dynamic content, static files are not processed by server-side scripts or languages (e.g., PHP, Python, Node.js) before being served.
Common Types of Static Files
HTML Files:
CSS Files:
Example: styles.css, main.css.
JavaScript Files:
Example: app.js, scripts.js.
Images:
Video and Audio Files:*/
// use this only in saving image in server not in cloud storage
// app.use('/images', express.static('uploads/images'));

// importing connection string.connection to mongo db atlas
const mongoURI = process.env.MONGO_URI;
// if
const PORT = process.env.PORT || 4000;
// mongodb connection
mongoose
  .connect(mongoURI)
  .then(() => console.log("mongodb atlas connected"))
  .catch((err) => console.log(err));

// using imported routes from another folder
// This means any request to the root URL ('/') or any subpath (like '/addproduct') will be handled by the routes defined in appRoutes.js.
// including api good. it distinguishes route from frontend route
app.use("/", appRoutes);

/* initiating the server and binding to port */
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server is running on port ${PORT}`);
  } else {
    /*can write ${error} or + error */
    console.log("Error:" + error);
  }
});
