const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;


const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    // Assuming the token is sent in the authorization header as 'Bearer [token]'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get the token from the header
	console.log('Authorization Header:', authHeader);


    if (token == null) {
      return res.sendStatus(401); // If no token, unauthorized
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
		console.log('SECRET_KEY:', SECRET_KEY);
		console.log('Error:', err);
		console.log('Token:', token);
      if (err) {
        return res.sendStatus(403); // If token is not valid, forbidden
      }

      // If the token is verified, add the user to the request object and proceed
      req.user = user;
      next();
    });
  });

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
