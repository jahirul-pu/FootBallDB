import { Job } from 'bullmq';

export interface IBaseJobData {
  id: string;
  triggeredBy: string; // userId or system
}

export abstract class BaseQueueProcessor<T extends IBaseJobData> {
  abstract process(job: Job<T>): Promise<void>;
  
  async handleFailure(job: Job<T>, err: Error): Promise<void> {
    // Default Dead-Letter / Error logging logic
    console.error(`Job ${job.id} failed:`, err.message);
  }
}
