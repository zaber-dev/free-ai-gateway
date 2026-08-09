export interface ScheduledJob {
  name: string;
  intervalMs: number;
  handler: () => Promise<void> | void;
  runImmediately?: boolean;
}

/**
 * Enterprise Job Scheduler for application-level background workers with isolated error boundaries.
 */
export class JobScheduler {
  private timers: NodeJS.Timeout[] = [];
  private jobs: ScheduledJob[] = [];
  private isRunning = false;

  public register(job: ScheduledJob): void {
    this.jobs.push(job);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    for (const job of this.jobs) {
      if (job.runImmediately) {
        this.executeJobSafely(job);
      }

      const timer = setInterval(() => {
        this.executeJobSafely(job);
      }, job.intervalMs);

      // Prevent background timers from keeping process alive if unrefed
      if (typeof timer.unref === "function") {
        timer.unref();
      }

      this.timers.push(timer);
    }
  }

  public stop(): void {
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers = [];
    this.isRunning = false;
  }

  private async executeJobSafely(job: ScheduledJob): Promise<void> {
    try {
      await job.handler();
    } catch (err: any) {
      console.error(`[JobScheduler] Background job "${job.name}" failed:`, err?.message || err);
    }
  }
}
