const path = require('path');
const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db');

// Load config
try {
  dotenv.config({ path: './config/config.env' });
} catch (error) {
}

// Passport config
require('./config/passport')(passport)

connectDB()

const app = express();

//Body parser to accept form data
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Method override (delete & replace)
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

// Logging

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Handlebars helpers
const { formatDate, editIcon, select } = require('./helpers/hbs')

//Handlebars template layout & set file extension to .hbs
app.engine('.hbs', exphbs({
  helpers: {
    formatDate,
    editIcon,
    select
  }, defaultLayout: 'main', extname: '.hbs'
}));

app.set('view engine', '.hbs');

// Sessions
app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next()
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/chunks', require('./routes/chunks'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server running on ${process.env.NODE_ENV} mode on port ${PORT}`));