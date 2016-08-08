mysql = require('mysql');
config = require('./config.js');

var mysqlutil = function(query, callback){
    var connection = mysql.createConnection({
                host: config.sqlURL,
                user: config.sqlUser,
                password: config.sqlPass,
                database: config.sqlDB
            });
    connection.connect();
    connection.query(query, callback);
    connection.end(function(err){
        if (err) console.log('mysqlerr',err);
    });
}

module.exports = mysqlutil;