import request from "supertest";
import app from "../dist/app.js";

test("Supertest can verify the API health contract", async () => {
  const response = await request(app).get("/api/v1/health").set("Accept", "application/json");
  expect(response.status).toBe(200);
  expect(response.body).toEqual({ success: true, status: "ok" });
});
