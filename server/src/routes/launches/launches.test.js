const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.model");

describe("TESTING LAUNCHES API", () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });
  afterAll(async () => {
    await mongoDisconnect();
  });
  describe("TEST to get /v1/launches", () => {
    test("It should respond with 200", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-type", /json/)
        .expect(200);
    });
  });

  describe("TEST post /v1/lauches", () => {
    const completeLaunchData = {
      mission: "vhurhv",
      rocket: "vnikrn",
      target: "Kepler-62 f",
      launchDate: "January 4, 2024",
    };

    const launchDataWithoutDate = {
      mission: "vhurhv",
      rocket: "vnikrn",
      target: "Kepler-62 f",
    };

    const launchDatawithInvalidDate = {
      mission: "vhurhv",
      rocket: "vnikrn",
      target: "Kepler-62 f",
      launchDate: "Jvrve",
    };

    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });
    test("IT should catch missing properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing launch property",
      });
    });

    test("It should catch the invalid date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDatawithInvalidDate)
        .expect("Content-type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch Date",
      });
    });
  });
});
