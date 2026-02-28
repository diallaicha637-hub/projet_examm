const mysql = require('mysql2');
const connection= mysql.createConnection({
    host: "localhost",
    user:"root",
    password:"root",
    database:"projet_examen"
});

connection.connect(err => {
    if (err) {
        console.log("Erreur ",err);
        return;
    } else{
        console.log("connecte a mysql")
    }
        
})
module.exports = connection;