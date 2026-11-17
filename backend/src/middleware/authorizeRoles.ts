import { problem } from "./problem.js";

export const authorizeRoles = (...roles: string[]) => (req: any, _res: any, next: any) => {
  if (req.user && roles.includes(req.user.role)) return next();
  return next(problem(403, "You do not have permission to access this resource.", { code: "forbidden" }));
};
