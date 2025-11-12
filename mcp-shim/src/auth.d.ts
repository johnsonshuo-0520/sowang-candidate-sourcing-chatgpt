import { Request, Response, NextFunction } from "express";
/**
 * Bearer token authentication middleware for MCP shim or API servers.
 *
 * Usage:
 *   import { auth } from "./auth";
 *   app.use(auth(true));
 *
 * Behavior:
 *   - If MCP_AUTH_TOKEN is set in environment variables, every incoming
 *     request must include a matching Authorization header:
 *       Authorization: Bearer <MCP_AUTH_TOKEN>
 *   - If MCP_AUTH_TOKEN is NOT set or required=false, all requests pass through.
 *
 * Example (with env):
 *   export MCP_AUTH_TOKEN="dev-secret-123"
 *   curl -H "Authorization: Bearer dev-secret-123" http://localhost:3001/health
 */
export declare function auth(required?: boolean): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map