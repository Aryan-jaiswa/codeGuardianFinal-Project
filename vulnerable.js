// vulnerable.js
const mysql = require('mysql');
const connection = mysql.createConnection({});

function login(userId) {
    // This is a classic SQL Injection for the demo
    const query = "SELECT * FROM users WHERE id = " + userId;
    connection.query(query, (err, result) => {
        console.log(result);
    });
}