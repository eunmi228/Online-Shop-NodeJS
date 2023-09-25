const dotenv = require('dotenv');
dotenv.config();

const password = process.env.PASSWORD;
const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect(`mongodb+srv://eunmijoo228:${password}@cluster0.wz8yn18.mongodb.net/shop?retryWrites=true&w=majority`)
    .then(client => {
        console.log('Connected!');
        _db = client.db();
        callback();
     })
    .catch(err => {
        console.log(err); 
        throw(err);
    });
}

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;