const express = require("express");
// const path = require("path");
const planetsRouter = require("./planets/planets.router");
const launchesRouter = require("./launches/launches.router");

const api = express.Router();

// api.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "..", "..", "public", "index.html"));
// });
api.use("/planets", planetsRouter);
api.use("/launches", launchesRouter);

module.exports = api;
