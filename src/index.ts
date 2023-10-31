import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mysql from 'mysql';

const app = express();

const db = mysql.createConnection({
    host: "localhost",
    user:"root",
    password:"kilnmenow",
    database:"dev"
});

// if you have auth problem
// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'kilnmenow';

app.use(express.json());
app.use(cors());

// ROUTES
app.get("/", (req, res) => {
    res.json("hello world");
});

app.get("/kilns", (req, res) => {
    const q = `SELECT * FROM dev.Kiln k 
    INNER JOIN dev.Address a ON k.address_id = a.id 
    INNER JOIN dev.Photo p on k.id = p.kiln_id`;
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    })
});

app.get("/kilns/:id", (req, res) => {
    console.log(req.params);
    const id = req.params.id;
    const q = `SELECT * FROM dev.Kiln k INNER JOIN dev.Address a ON k.address_id = a.id WHERE k.id = ${id}`;
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.get('/address', (req, res) => {
    const query = "SELECT * FROM dev.Address"
    db.query(query, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.post("/kilns", (req, res) => {
    const q = "(id, host_id, title, description, user_id, is_available, created_at, size, cone, address_id, latitude, longitude, turnaround, listing_price) VALUES"
    const {id, user_id, title, description, is_available, size, cone, address_id, listing_price, kiln_type} = req.body;
    const values = [
        id,
        user_id,
        title,
        description,
        is_available,
        size,
        cone,
        address_id,
        listing_price,
        kiln_type
    ];
    db.query(q, [values], (err, data) => {
        if (err) return res.json(err);
        return res.json("Kiln Successfully Registered");
    })
});

// app.use(compression());
// app.use(cookieParser());

// const server = http.createServer(app);

app.listen(6969, () => {
    console.log('Server running on http://localhost:6969/')
});