import test from "node:test";
import assert from "node:assert/strict";

const { createAuditLogRepository } = await import("../dist/services/sql/auditLog.js");
const { callSoapOperation } = await import("../dist/services/soapService.js");

test("SQL audit repository uses parameter placeholders and values", async () => {
  const queries = [];
  const repository = createAuditLogRepository({
    query: async (text, values) => {
      queries.push({ text, values });
      return {};
    },
  });
  await repository.ensureTable();
  await repository.record({ requestId: "req-1", method: "GET", path: "/health", status: 200 });
  assert.match(queries[1].text, /VALUES \(\$1, \$2, \$3, \$4\)/);
  assert.deepEqual(queries[1].values, ["req-1", "GET", "/health", 200]);
});

test("SOAP service reads a WSDL client and invokes the requested operation", async () => {
  let received;
  const fakeClientFactory = async (wsdl, options) => {
    assert.equal(wsdl, "https://example.test/calculator.wsdl");
    assert.equal(options.wsdl_options.timeout, 10000);
    return {
      AddAsync: async (args) => {
        received = args;
        return [{ AddResult: 7 }];
      },
    };
  };
  const result = await callSoapOperation(
    "https://example.test/calculator.wsdl",
    "Add",
    { intA: 3, intB: 4 },
    fakeClientFactory,
  );
  assert.deepEqual(received, { intA: 3, intB: 4 });
  assert.deepEqual(result, { AddResult: 7 });
});
