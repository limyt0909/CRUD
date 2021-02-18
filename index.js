const express = require("express");
const path = require("path");
const ejs = require("ejs");
const sqlite3 = require("sqlite3").verbose();

const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'apptest.db'");
});

const sql_create = `CREATE TABLE IF NOT EXISTS Books (
  Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,

  Title VARCHAR(100) NOT NULL,
  Author VARCHAR(100) NOT NULL, 
  Comments TEXT
);`;
// db.run : 첫번째 파라미터로 넘어온 sql query 실행, 그리고 두번째 파라미터인 callback함수 실행함
db.run(sql_create, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'Books' table");
});

// Creating the Express server
const app = express();

// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false })); // <--- middleware configuration
// Starting the server
app.listen(3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

// GET /
app.get("/", (req, res) => {
  // res.send("Hello world...");
  res.render("index");
});

// GET /about
app.get("/about", (req, res) => {
  res.render("about");
});

// GET /data
app.get("/data", (req, res) => {
  const test = {
    titre: "Test",
    items: ["one", "two", "three"],
  };
  res.render("data", { model: test });
});

app.get("/books", (req, res) => {
  const sql = "SELECT * FROM Books ORDER BY Title";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("books", { model: rows });
  });
});

// GET /edit/5
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("edit", { model: row });
  });
});

// Request.body에서 posted value를 받기 위해서는 middleware인 express.urlencoded()를 사용해야 한다.
// app.use()를 통해 수행할 수 있다.
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const book = [req.body.Title, req.body.Author, req.body.Comments, id];
  const sql =
    "UPDATE Books SET Title=?, Author=?, Comments=? WHERE (Book_ID = ?)";
  db.run(sql, book, (err) => {
    if (err) {
      console.error(err.message);
    }
    res.redirect("/books");
  });
});

// GET /create
app.get("/create", (req, res) => {
  const book = {
    Author: " ",
  };
  res.render("create", { model: book });
});

// POST /create
app.post("/create", (req, res) => {
  const sql = "INSERT INTO Books (Title, Author, Comments) VALUES (?, ?, ?)";
  const book = [req.body.Title, req.body.Author, req.body.Comments];
  db.run(sql, book, (err) => {
    // if (err) ...
    res.redirect("/books");
  });
});

//GET //delete
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID=?";
  db.get(sql, id, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    res.render("delete", { model: row });
  });
});
//POST //delete
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Books WHERE Book_ID=?";
  db.run(sql, id, (err) => {
    if (err) {
      console.error(err.message);
    }
    res.redirect("/books");
  });
});

//more
app.get("/more/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID=?";
  db.get(sql, id, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    res.render("more", { model: row });
  });
});
