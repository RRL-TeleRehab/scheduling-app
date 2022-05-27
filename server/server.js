const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const winston = require("./helpers/logger");
require("dotenv").config();

const app = express();
mongoose
  .connect(process.env.MONGO_ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.log("Error connecting to MongoDB"));

// import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const storyRoutes = require("./routes/story");

// Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// It shows the real origin IP in the heroku or Cloudwatch logs
app.enable("trust proxy");

// app middleware
app.use(morgan("combined", { stream: winston.stream }));
app.use(morgan("dev"));

// Enable Cross Origin Resource Sharing to all origins by default
app.use(cors());

// Some extra protection
app.use(helmet());

// Middleware that transforms the raw string of req.body into json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: `http://localhost:3000` || process.env.CLIENT_URL,
    })
  ); // allow all requests from all domains
}

// middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", storyRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port} - ${process.env.NODE_ENV}`);
});
