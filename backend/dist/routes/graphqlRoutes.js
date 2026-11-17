import { Router } from "express";
import { executeGraphql } from "../services/graphql.js";
import { problem } from "../middleware/problem.js";
const router = Router();
router.post("/", async (req, res) => {
    if (!req.body || typeof req.body.query !== "string") {
        throw problem(400, "GraphQL request must include a query string.", { code: "invalid_graphql_request" });
    }
    const result = await executeGraphql(req.body.query, req.body.variables);
    if (result.errors?.length)
        return res.status(400).json(result);
    return res.json(result);
});
export default router;
