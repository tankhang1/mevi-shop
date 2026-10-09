import { clerkClient, getAuth } from "@clerk/express";
import type { Request, RequestHandler } from "express";

export type AppRole = "admin" | "agency" | "buyer";

export interface AuthContext {
  userId: string;
  role: AppRole;
  agencySlug: string | null;
}

const roles = new Set<AppRole>(["admin", "agency", "buyer"]);

export async function getAuthContext(
  req: Request,
): Promise<AuthContext | null> {
  const { userId } = getAuth(req);
  if (!userId) return null;

  const user = await clerkClient.users.getUser(userId);
  const metadata = user.publicMetadata as Record<string, unknown>;
  const metadataRole = metadata.role;
  const role =
    typeof metadataRole === "string" && roles.has(metadataRole as AppRole)
      ? (metadataRole as AppRole)
      : "buyer";
  const agencySlug =
    typeof metadata.agencySlug === "string" ? metadata.agencySlug : null;

  return { userId, role, agencySlug };
}

export function requireRole(...allowedRoles: AppRole[]): RequestHandler {
  return async (req, res, next): Promise<void> => {
    try {
      const context = await getAuthContext(req);
      if (!context) {
        res.status(401).json({ error: "Sign in required" });
        return;
      }
      if (!allowedRoles.includes(context.role)) {
        res.status(403).json({ error: "Insufficient role" });
        return;
      }
      res.locals.authContext = context;
      next();
    } catch (error) {
      req.log.error({ err: error }, "Failed to resolve authenticated user");
      res.status(500).json({ error: "Unable to verify account role" });
    }
  };
}

export function currentAuthContext(
  res: Parameters<RequestHandler>[1],
): AuthContext {
  return res.locals.authContext as AuthContext;
}
