import "server-only";
import { cache } from "react";
import { listPendingCases, type QueueRow } from "./triage-queue.repository";

export const loadPendingQueue = cache(async (): Promise<QueueRow[]> => {
  return listPendingCases();
});