require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const userRout = require("./routes/userRouter");
const categoryRout = require("./routes/categoryRouter");
const uploadImg = require("./routes/uploadImage");
const productRout = require("./routes/productRouter");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use("/user", userRout);
app.use("/api", categoryRout);
app.use("/api", uploadImg);
app.use("/api", productRout);

const url = process.env.DATABASE_URL;

mongoose.connect(url, {
    useCreateIndex : true,
    useFindAndModify : false,
    useNewUrlParser: true,
    useUnifiedTopology : true,
}, err => {
    if (err) throw err;
    console.log('connect mongodb');
});

const _port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("e-commerse server");
});

app.listen(_port, () => {
    console.log(`server is running on ${_port}`);
})