
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

// connexion base de données
const connection = require("./config/db");

// configuration EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// routes
const tacheRoutes = require("./route/tache_route");

app.use("/", tacheRoutes);

app.listen(port, "127.0.0.1", () => {
    console.log(`Serveur lancé sur http://127.0.0.1:${port}`);
});