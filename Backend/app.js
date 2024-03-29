const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require('cors');
const authJwT = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
require("dotenv/config");

app.use(cors());
app.options('*', cors());

//middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwT());
app.use(errorHandler);
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

//Routers
const categoriesRoutes = require('./routers/categories');
const productRoutes = require('./routers/products');
const usersRoutes = require('./routers/users')
const ordersRoutes = require('./routers/orders');
//const authJwT = require("./helpers/jwt");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//Database connection
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "e-commerce-db",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

//Server
app.listen(3000, () => {
  console.log("Server is running http://localhost:3000");
});
