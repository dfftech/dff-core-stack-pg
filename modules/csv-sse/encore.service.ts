import { Service } from "encore.dev/service";

/** Dedicated service for streaming remote CSV records as Server-Sent Events. */
export default new Service("csv-sse");
