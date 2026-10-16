const express = require("express");
const db = require("./db");

const app = express();

app.use(express.json());


// API 1: Check backend status
app.get("/", (req, res) => {
    res.send("Hospital Management System is Running");
});


// API 2: Register a patient
app.post("/patients", (req, res) => {

    const {
        patient_name,
        age,
        gender,
        phone,
        medical_condition
    } = req.body;

    if (!patient_name) {
        return res.status(400).json({
            message: "Patient name is required"
        });
    }

    const sql = `
        INSERT INTO patients
        (patient_name, age, gender, phone, medical_condition)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [patient_name, age, gender, phone, medical_condition],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Patient registered successfully",
                patient_id: result.insertId
            });
        }
    );
});


// API 3: Get all patients
app.get("/patients", (req, res) => {

    const sql = "SELECT * FROM patients";

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});


// API 4: Add patient to queue
app.post("/queue", (req, res) => {

    const { patient_id, priority } = req.body;

    if (
        !Number.isInteger(patient_id) ||
        ![1, 2].includes(priority)
    ) {
        return res.status(400).json({
            message: "Valid patient_id and priority are required"
        });
    }

    const sql = `
        INSERT INTO patient_queue
        (patient_id, priority)
        VALUES (?, ?)
    `;

    db.query(sql, [patient_id, priority], (err, result) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.status(201).json({
            message: "Patient added to queue",
            queue_id: result.insertId
        });
    });
});


// API 5: View patient queue
app.get("/queue", (req, res) => {

    const sql = `
        SELECT
            q.queue_id,
            p.patient_name,
            p.medical_condition,
            q.priority,
            q.arrival_time,
            q.status
        FROM patient_queue q
        JOIN patients p
            ON q.patient_id = p.patient_id
        WHERE q.status = 'Waiting'
        ORDER BY
            q.priority DESC,
            q.arrival_time ASC,
            q.queue_id ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});


// Start backend server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
