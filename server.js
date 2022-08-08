const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const winston = require("./helpers/logger");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
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
const availabilityRoutes = require("./routes/availability");
const appointmentsRoutes = require("./routes/appointments");

// Useful if you're behind a reverse proxy (Heroku, Blue mix, AWS ELB, Nginx, etc)
// It shows the real origin IP in the heroku or Cloudwatch logs
app.enable("trust proxy");

// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// app middleware
app.use(morgan("combined", { stream: winston.stream }));
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
  )
);

// Enable Cross Origin Resource Sharing to all origins by default
app.use(cors());

// Some extra protection
app.use(helmet());

// Middleware that transforms the raw string of req.body into json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: `http://localhost:3000` || process.env.CLIENT_URL,
    })
  ); // allow all requests from particular origins
}

// middleware
app.use("/api", limiter, authRoutes);
app.use("/api", limiter, userRoutes);
app.use("/api", limiter, storyRoutes);
app.use("/api", limiter, availabilityRoutes);
app.use("/api", limiter, appointmentsRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port} - ${process.env.NODE_ENV}`);
  console.log(new Date());
});
