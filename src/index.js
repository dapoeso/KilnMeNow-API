import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mysql from "mysql";

const app = express();

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
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
    INNER JOIN dev.Address a ON k.address_id = a.address_id 
    INNER JOIN dev.Photo p on k.kiln_id = p.kiln_id`;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/kilns/:id", (req, res) => {
  console.log(req.params);
  const id = req.params.id;
  const q = `SELECT * FROM dev.Kiln k 
    INNER JOIN dev.Address a ON k.address_id = a.address_id 
    INNER JOIN dev.Photo p on k.kiln_id = p.kiln_id
    WHERE k.kiln_id = ${id}`;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/kilnsByUser/:id", (req, res) => {
  console.log(req.params);
  const id = req.params.id;
  const q = 
    `SELECT k.kiln_id, title, p.url, r.user_id, r.status, u2.username, r.id as reservation_id
    from dev.Kiln k
    LEFT JOIN dev.User u on k.user_id = u.user_id
    LEFT JOIN dev.Reservation r on r.kiln_id = k.kiln_id
    LEFT Join dev.Photo p on k.kiln_id = p.kiln_id
    LEFT Join dev.User u2 on u2.user_id = r.user_id
    WHERE k.user_id = '${id}'`;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/reservationsByKilnIds", (req, res) => {
  console.log(req.body);
  const ids = req.body.ids;
  const q = `SELECT * FROM dev.Reservation WHERE kiln_id in (?)`;
  const values = [ids];
  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/address", (req, res) => {
  const query = "SELECT * FROM dev.Address";
  db.query(query, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/users", (req, res) => {
  console.log(req.body);
  const q = `INSERT INTO dev.User (user_id, email) VALUES (?);`;
  const { id, email } = req.body;
  const values = [id, email];
  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    console.log(data);
    return res.json(data);
  });
});

app.get("/users/:email", (req, res) => {
  console.log(req.params);
  const email = req.params.email;
  const q = `SELECT * FROM dev.User WHERE email="${email}"`;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.patch("/users/:email", (req, res) => {
  console.log(req.body);
  const { firstName, lastName, phone } = req.body;
  const email = req.params.email;
  const q = `UPDATE dev.User SET first_name="${firstName}", last_name="${lastName}", phone="${phone}" WHERE email="${email}"`;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    console.log(data);
    return res.json(data);
  });
});

app.post("/address", (req, res) => {
    const q = `INSERT INTO dev.Address (address_1, address_2, city, state, postal, country, user_id, is_billing) VALUES (?);`;
    const {address1, address2, city, state, zip, country, userId, isBilling } = req.body;
    const values = [address1, address2, city, state, zip, country, userId, isBilling];
    db.query(q, [values], (err, data) => {
      if (err) return res.json(err);
      return res.json({id: data.insertId});
    });
    // const q2 = `SELECT * FROM dev.Address WHERE user_id=${userId} ORDER BY address_id DESC LIMIT 1`;
    // db.query(q2, (err, data) => {
    //   if (err) return res.json(err);
    //   console.log(data);
    //   return res.json(data);
    // });
});

app.post("/kilns", (req, res) => {
    console.log(req.body);
  const q = `INSERT INTO dev.Kiln (user_id, title, description, is_available, size, cone, address_id, latitude, longitude, turnaround, listing_price) VALUES (?);`;
  let kilnId
  const {
    userId,
    name,
    description,
    isAvailable,
    size,
    cone,
    addressId,
    price,
    latitude,
    longitude,
    turnaround,
    url,
  } = req.body;
  const values = [
    userId,
    name,
    description,
    isAvailable,
    size,
    cone,
    addressId,
    latitude,
    longitude,
    turnaround,
    price,
  ];
  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    console.log(data);
    kilnId = data.insertId;
    console.log('kiln id', kilnId);
    const q2 = `INSERT INTO dev.Photo (kiln_id, url) VALUES (?);`;
    const photoValues = [kilnId, url];
        db.query(q2, [photoValues], (err, data) => {
            if (err) return res.json(err);
            console.log(data);
            return res.json(data);
        });
  });
});

app.post("/reservation", (req, res) => {
    const q = `INSERT INTO dev.Reservation (user_id, kiln_id, price, status) VALUES (?);`;
    const {userId, kilnId, price, status } = req.body;
    const values = [userId, kilnId, price, status];
    db.query(q, [values], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
});

app.get("/reservation/:id", (req, res) => {
    const q = `SELECT * from dev.Reservation r 
    INNER JOIN dev.Kiln k on r.kiln_id = k.kiln_id
    INNER JOIN dev.Photo p on r.kiln_id = p.kiln_id 
    WHERE r.user_id = '${req.params.id}'`;
    db.query(q, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
});

// app.patch("/reservation/:id", (req, res) => {
//     const q = `UPDATE dev.Reservation SET is_complete=1 WHERE id=${req.params.id}`;
//     db.query(q, (err, data) => {
//       if (err) return res.json(err);
//       return res.json(data);
//     });
// });

app.patch("/cancel-reservation/:id", (req, res) => {
    const q = `DELETE FROM dev.Reservation WHERE id=${req.params.id}`;
    db.query(q, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
});

app.patch("/update-reservation/:id", (req, res) => {
  console.log(req.body);
  const { status } = req.body;
  const id = req.params.id;
  const q = `UPDATE dev.Reservation SET status="${status}" WHERE id="${id}"`;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});


// app.use(compression());
// app.use(cookieParser());

// const server = http.createServer(app);
const port = process.env.PORT || 6969;

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
