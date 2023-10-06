const fs = require("fs");
const { parse } = require("csv-parse");
const path = require("path");
const planets = require("./planets.mongo");

const isHabitablePlanet = (planet) => {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
};

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    console.log("start");
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const count = (await getAllplanets()).length;
        console.log("loading---- completed", " habitable planets-", count);
        resolve("done");
      });
  });
}

const getAllplanets = async () => {
  return await planets.find({}, { __v: 0, _id: 0 });
};

const savePlanet = async (planet) => {
  return await planets.updateOne(
    {
      keplerName: planet.kepler_name,
    },
    { keplerName: planet.kepler_name },
    { upsert: true }
  );
};

module.exports = {
  loadPlanetsData,
  getAllplanets,
};
