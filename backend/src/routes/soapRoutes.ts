import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { problem, requireObjectBody, rejectUnknownFields } from "../middleware/problem.js";
import { callSoapOperation, DEFAULT_CALCULATOR_WSDL } from "../services/soapService.js";

const router = Router();

router.post("/calculator/add", authMiddleware, async (req, res) => {
  const body = requireObjectBody(req.body);
  rejectUnknownFields(body, ["intA", "intB"]);
  const intA = Number(body.intA);
  const intB = Number(body.intB);
  if (!Number.isInteger(intA) || !Number.isInteger(intB)) {
    throw problem(422, "intA and intB must be integers.", { code: "invalid_soap_arguments" });
  }
  try {
    const result = await callSoapOperation(
      process.env.SOAP_WSDL_URL || DEFAULT_CALCULATOR_WSDL,
      "Add",
      { intA, intB },
    );
    return res.json({ success: true, result });
  } catch (error) {
    throw Object.assign(new Error("SOAP provider is unavailable."), {
      status: 503,
      code: "soap_unavailable",
      expose: true,
      cause: error,
    });
  }
});

export default router;
