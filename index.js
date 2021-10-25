require("express-async-errors");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const app = express();
const mongoose = require("mongoose");
const Product = require("./models/product");

const PORT = process.env.PORT;
let isLogged = false;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

diskStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, done) => {
      done(null, "uploads");
    },
    filename: (req, file, done) =>
      done(null, Date.now() + "-" + file.originalname),
  });

uploadImage = () =>
  multer({
    storage: diskStorage(`${__dirname}/uploads/`),
    fileFilter: (req, file, callback) => {
      const ext = file.mimetype;
      if (
        ext !== "image/png" &&
        ext !== "image/jpg" &&
        ext !== "image/gif" &&
        ext !== "image/jpeg"
      ) {
        return callback(new Error("Only image are allowed"), false);
      }
      callback(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  });

// set the view engine to ejs
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/")); //This line is necessary for us to use relative paths and access our resources directory

app.get("/", async function (req, res) {
  if (!isLogged) {
    res.render("pages/login");
  }

  const data = await Product.find();
  if (data) {
    res.render("pages/main", {
      data: data,
    });
  }
});

app.get("/products/add", function (req, res) {
  if (!isLogged) {
    res.render("pages/login");
  }

  res.render("pages/form");
});

app.get("/login", function (req, res) {
  res.render("pages/login");
});

app.post("/login", function (req, res) {
  const { userName, password } = req.body;
  if (userName === "admin" && password === "admin") {
    isLogged = true;
    return res.redirect("/");
  }

  res.render("pages/login");
});

app.post("/products", uploadImage().single("file"), async function (req, res) {
  if (!isLogged) {
    res.render("pages/login");
  }

  await Product.create({
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
    imgUrl: `/uploads/${req.file.filename}`,
  });

  return res.redirect("/");
});

app.get("/products/:id/delete", async function (req, res) {
  if (!isLogged) {
    res.render("pages/login");
  }

  const products = await Product.deleteOne({ _id: req.params.id }).exec();
  if (products.deletedCount > 0) {
    return res.redirect("/");
  }
});

mongoose
  .connect(
    "mongodb+srv://ducgmgch17348:ducgmgch17348@cluster0.y3wll.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log("Server is listening on port " + PORT);
    });
  })
  .catch((err) => console.log("Error connect: " + err));
