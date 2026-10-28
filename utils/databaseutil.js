const mysql = require('mysql2');
const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'aaysha100',
    database:'personalfinancedb'



});
module.exports=pool.promise();
