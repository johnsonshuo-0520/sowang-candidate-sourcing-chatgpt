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
export function auth(required = true) {
    // Read the expected token once at startup
    const TOKEN = process.env.MCP_AUTH_TOKEN;
    // Return standard Express middleware
    return (req, res, next) => {
        // Allow all requests if auth not required or no token defined
        if (!required || !TOKEN)
            return next();
        // Extract and compare header
        const header = req.headers.authorization || "";
        const ok = header === `Bearer ${TOKEN}`;
        if (ok) {
            return next();
        }
        else {
            res.status(401).json({ error: "Unauthorized" });
        }
    };
}
//# sourceMappingURL=auth.js.map