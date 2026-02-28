const express = require("express");
const router = express.Router();
const connection = require("../config/db");


// PAGE PRINCIPALE – liste + recherche + filtres

router.get("/", (req, res) => {
    const { search, statut, priorite } = req.query;

    let sql = "SELECT * FROM tache WHERE 1=1";
    const params = [];

    if (search) {
        sql += " AND (titre LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    if (statut) {
        sql += " AND statut = ?";
        params.push(statut);
    }

    if (priorite) {
        sql += " AND priorite = ?";
        params.push(priorite);
    }

    sql += " ORDER BY date_creation DESC";

    connection.query(sql, params, (err, results) => {
        if (err) return res.status(500).send("Erreur base de données");

        const now = new Date();

        const tache = results.map(t => {
            const limite = new Date(t.date_limite);
            return {
                ...t,
                en_retard: t.statut !== "termine" && limite < now
            };
        });

        res.render("index", {
            tache,
            search: search || "",
            statut: statut || "",
            priorite: priorite || ""
        });
    });
});



// AJOUTER une tâche

router.post("/ajouter", (req, res) => {
    const { titre, description, priorite, date_limite, responsable } = req.body;

    const date_creation = new Date();
    const statut = "a faire";

    const sql = `
        INSERT INTO tache 
        (titre, description, priorite, statut, date_creation, date_limite, responsable)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [titre, description, priorite, statut, date_creation, date_limite, responsable],
        (err) => {
            if (err) return res.status(500).send("Erreur lors de l'ajout");
            res.redirect("/");
        }
    );
});



// CHANGER STATUT
// a faire → en cours → termine

router.get("/changer-statut/:id", (req, res) => {

    connection.query(
        "SELECT statut FROM tache WHERE id = ?",
        [req.params.id],
        (err, results) => {

            if (err || results.length === 0) return res.redirect("/");

            const actuel = results[0].statut;
            let suivant = null;

            if (actuel === "a faire") suivant = "en cours";
            else if (actuel === "en cours") suivant = "termine";

            if (!suivant) return res.redirect("/");

            connection.query(
                "UPDATE tache SET statut = ? WHERE id = ?",
                [suivant, req.params.id],
                (err) => {
                    if (err) return res.status(500).send("Erreur changement de statut");
                    res.redirect("/");
                }
            );
        }
    );
});



// SUPPRIMER une tâche

router.get("/supprimer/:id", (req, res) => {

    connection.query(
        "DELETE FROM tache WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).send("Erreur lors de la suppression");
            res.redirect("/");
        }
    );
});



// MODIFIER – afficher formulaire
router.get("/modifier/:id", (req, res) => {

    connection.query(
        "SELECT * FROM tache WHERE id = ?",
        [req.params.id],
        (err, results) => {

            if (err || results.length === 0) return res.redirect("/");

            const tache = results[0];

            if (tache.statut === "termine") return res.redirect("/");

            res.render("modifier", { tache });
        }
    );
});



// MODIFIER – traitement

router.post("/modifier/:id", (req, res) => {

    const { titre, description, priorite, date_limite, responsable } = req.body;

    const sql = `
        UPDATE tache 
        SET titre = ?, description = ?, priorite = ?, date_limite = ?, responsable = ?
        WHERE id = ? AND statut != 'termine'
    `;

    connection.query(
        sql,
        [titre, description, priorite, date_limite, responsable, req.params.id],
        (err) => {
            if (err) return res.status(500).send("Erreur lors de la modification");
            res.redirect("/");
        }
    );
});



// DASHBOARD

router.get("/dashboard", (req, res) => {

    connection.query("SELECT * FROM tache", (err, taches) => {

        if (err) return res.status(500).send("Erreur base de données");

        const now = new Date();

        const total = taches.length;

        const termine = taches.filter(t => 
            t.statut === "termine"
        ).length;

        const pourcentage = total > 0 
            ? Math.round((termine / total) * 100) 
            : 0;

        const retard = taches.filter(t => 
            t.statut !== "termine" &&
            new Date(t.date_limite) < now
        ).length;

        res.render("dashboard", {
            total,
            termine,
            pourcentage,
            retard
        });
    });
});
// RAPPORT
router.get("/rapport", (req, res) => {
    res.render("rapport");
});

module.exports = router;