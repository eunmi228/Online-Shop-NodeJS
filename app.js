const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const password = process.env.PASSWORD;
const errorController = require('./controllers/error');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const User = require('./models/user');

const MONGODB_URI = `mongodb+srv://eunmijoo228:${password}@cluster0.wz8yn18.mongodb.net/shop?&w=majority`;
const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}));

// define csrf middleware after initialize the session
// csrf package look for a csrf token in any non-get requests
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        console.log(req.user);
        next();
    })
    .catch(err => console.log(err));
});

// set local variables that are passed into the views
// for every request, the following fields will be set for the views
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
.then(() => {
    app.listen(3000);
})
.catch(err => {
    console.log(err);
})