const request = require("supertest");
const app = require("./app");

describe("GET /", () => {
  it("returns the welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("My Express server is working!");
  });
});
