import soap from "soap";

export const DEFAULT_CALCULATOR_WSDL =
  "http://www.dneonline.com/calculator.asmx?WSDL";

export async function callSoapOperation(
  wsdlUrl: string,
  method: string,
  args: Record<string, unknown>,
  createClient = soap.createClientAsync,
) {
  const client = await createClient(wsdlUrl, {
    wsdl_options: { timeout: Number(process.env.SOAP_TIMEOUT_MS) || 10_000 },
  });
  const operation = client[`${method}Async`];
  if (typeof operation !== "function") {
    throw new Error(`SOAP operation ${method} is not available in the WSDL.`);
  }
  const [result] = await operation.call(client, args);
  return result;
}
