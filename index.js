const express = require("express");
const { logger, notFound, errorHandler } = require("./middleware");
const plantsRouter = require("./routes/plants");
const gardenersRouter = require("./routes/gardeners");

const app = express();
const PORT = 3000;

//Global Middleware
app.use(logger);
app.use(express.json());

//Root Welcome Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Community Seed & Plant Swap API",
    author: "Syifa Nurul Fadilah",
    theme: "Community Seed & Plant Swap",
  });
});

//Wildcard Route
app.get("/files/*path", (req, res) => {
  const rawPath = req.params.path;
  const segments = Array.isArray(rawPath)
    ? rawPath
    : String(rawPath || "")
        .split("/")
        .filter(Boolean);

  res.status(200).json({
    path: segments,
    totalSegments: segments.length,
  });
});

//Resource Routers
app.use("/plants", plantsRouter);
app.use("/gardeners", gardenersRouter);

// 404 Handler
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server Running on http://localhost: ${PORT}`);
});
