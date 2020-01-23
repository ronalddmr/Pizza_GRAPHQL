const pgPromise = require('pg-Promise');
const pgp = pgPromise({});
const config = {
    host: 'localhost',
    port: '5432',
    database: 'pizza',
    user: 'postgres',
    password: 'ronald1999emelec'
}
const db = pgp(config);
//db.any('select * from pizza').then(res => { console.log(res); });0

exports.db = db ;