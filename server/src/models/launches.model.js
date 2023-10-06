const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("error getting request spacex");
    throw new Error("Spacex fetch failed");
  }
  const launchDocs = response.data.docs;

  for (const launchitem of launchDocs) {
    const payloads = launchitem.payloads;
    const customers = payloads.flatMap((pay) => {
      return pay.customers;
    });

    const launch = {
      flightNumber: launchitem.flight_number,
      mission: launchitem.name,
      rocket: launchitem.rocket.name,
      launchDate: launchitem.date_local,
      customers: customers,
      upcoming: launchitem.upcoming,
      success: launchitem.success,
    };

    console.log("populating launches- ", launch.flightNumber);

    await saveLaunch(launch);
  }
}

async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find({}, { __v: 0, _id: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({ keplerName: launch.target });

  if (!planet) {
    throw new Error("planet not available");
  } else {
    const flightNumber = await getLatestLaunchNumber();
    const newLaunch = Object.assign(launch, {
      flightNumber: flightNumber + 1,
      customers: ["RIO", "M-SEC2000"],
      upcoming: true,
      success: true,
    });

    await saveLaunch(newLaunch);
  }
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    { flightNumber: launchId },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.matchedCount === 1 && aborted.modifiedCount === 1;
}

const getLatestLaunchNumber = async () => {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
};

async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("launch already loaded");
  } else {
    await populateLaunches();
  }
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  loadLaunchData,
  existLaunchWithId,
  abortLaunchById,
};
