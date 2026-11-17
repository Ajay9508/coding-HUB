const escapeXml = (value: unknown) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const serialize = (key: string, value: unknown): string => {
  if (value === null || value === undefined) return `<${key}/>`;
  if (Array.isArray(value)) return value.map((item) => serialize(key, item)).join("");
  if (typeof value === "object") {
    return `<${key}>${Object.entries(value as Record<string, unknown>)
      .map(([childKey, childValue]) => serialize(childKey.replace(/[^A-Za-z0-9_.-]/g, "_"), childValue))
      .join("")}</${key}>`;
  }
  return `<${key}>${escapeXml(value)}</${key}>`;
};

export default function contentNegotiation(req: any, res: any, next: any) {
  const acceptsXml = req.accepts(["application/json", "application/xml"]) === "application/xml";
  if (acceptsXml) {
    const json = res.json.bind(res);
    res.json = (body: unknown) => {
      res.type("application/xml");
      return res.send(`<?xml version="1.0" encoding="UTF-8"?>${serialize("response", body)}`);
    };
    res.locals.jsonResponse = json;
  }
  next();
}
