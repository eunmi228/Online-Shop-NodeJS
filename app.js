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
const multer = require('multer');
const flash = require('connect-flash');
const User = require('./models/user');

const MONGODB_URI = `mongodb+srv://eunmijoo228:${password}@cluster0.wz8yn18.mongodb.net/shop?&w=majority`;
const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csrf();

const fileStroage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStroage, fileFilter: fileFilter }).single('image')); // extract 'image' file and stores it (define in fileStorage)
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));

// define csrf middleware after initialize the session
// csrf package look for a csrf token in any non-get requests
app.use(csrfProtection);
app.use(flash());

// set local variables that are passed into the views
// for every request, the following fields will be set for the views
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) { // user stores in session but not in db
                return next();
            }
            req.user = user;
            console.log(req.user);
            next();
        })
        .catch(err => {
            // throw new Error(err); // throw an error in side of async code doesn't reach to error handling middleware
            next(new Error(err)); // throw an error instead of logging
        });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => { // error handling middleware
    res.status(error.httpStatusCode).render('500', { pageTitle: 'Error!', path: '/500' });
})
mongoose.connect(MONGODB_URI)
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })