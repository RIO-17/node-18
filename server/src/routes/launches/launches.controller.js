const {
  getAllLaunches,
  scheduleNewLaunch,
  existLaunchWithId,
  abortLaunchById,
} = require("../../models/launches.model");

const getPagination = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpAddNewLaunches(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Missing launch property",
    });
  }

  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch Date",
    });
  }

  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunches(req, res) {
  const id = Number(req.params.id);

  const existLaunch = await existLaunchWithId(id);
  //   check if launch available
  if (existLaunch) {
    const aborted = await abortLaunchById(id);
    if (!aborted) {
      return res.status(400).json({
        error: "not aborted",
      });
    }
    return res.status(200).json({
      ok: true,
    });
  } else {
    return res.status(404).json({
      error: "Launch not found",
    });
  }
}

module.exports = { httpGetAllLaunches, httpAddNewLaunches, httpAbortLaunches };
