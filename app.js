const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

app.use(express.json());

const db = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

db.getConnection((err, connection) => {
  if (err) {
    throw err;
  }
  console.log("DB connected successfully:", connection.threadId);
});

app.get("/", (req, res) => {
  return res.status(200).json({ success: true, msg: "Alive" });
});

// ######################################## Create User API ####################################### 🚀🚀
app.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;
  const plan = "Silver";
  const userId = Math.random() * 1000000000;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const searchUser = "SELECT * FROM userTable WHERE email = ?";
    const search_query = mysql.format(searchUser, [email]);

    const sqlInsert = "INSERT INTO userTable VALUES (?,?,?,?,?,?)";
    const insert_query = mysql.format(sqlInsert, [
      userId,
      name,
      hashedPassword,
      email,
      phone,
      plan,
    ]);

    await connection.query(search_query, async (err, result) => {
      if (err) throw err;

      console.log(result.length);

      if (result.length !== 0) {
        connection.release();
        console.log("User already exists");
        return res.status(409);
      } else {
        await connection.query(insert_query, (err, result) => {
          connection.release();
          if (err) throw err;
          // console.log("user created successfully");
          return res
            .status(201)
            .json({ success: true, msg: "user created successfully" });
        });
      }
    });
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is runnning on port ${port}`));
