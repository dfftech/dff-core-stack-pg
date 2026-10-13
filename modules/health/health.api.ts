import { readFileSync } from "node:fs";
import { join } from "node:path";
import { api } from "encore.dev/api";
import type { RequestByIdType, ResponseType } from "dff-util";
import { logger, session_meta } from "../../utils/app-util";

function appVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8")
    ) as { version?: string };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

const version = appVersion();

/** :id is the tenant for health only. */
type HealthRequest = RequestByIdType & {
  query?: string;
};

export const HealthCheck = api<HealthRequest, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/health/:id",
  },
  async (params: HealthRequest) => {
    try {
      const tenant = String(params.id);
      const { logger } = session_meta();
      await logger.info("Processing health request", {
        tenant,
        version,
        query: params.query,
      });
      return {
        status: 200,
        data: {
          message: "Health Check Pass",
          tenant,
          version,
          query: params.query ? { query: params.query } : undefined,
        },
      };
    } catch (error) {
      logger().error(`Failed to health check: ${error}`);
      throw error;
    }
  }
);
