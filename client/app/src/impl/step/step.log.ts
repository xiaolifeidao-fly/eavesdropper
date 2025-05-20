import { createSkuTaskStepLog, getSkuTaskStepLog } from "@api/sku/skuTask.api";
import { SkuTaskStepLog } from "@model/sku/skuTask";
import log from "electron-log";




export class StepLog {
    private queue: Array<{ skuTaskStepId: number; content: string }> = [];
    private isProcessing: boolean = false;
    private processingInterval: NodeJS.Timeout | null = null;

    constructor() {
    }

    /**
     * Add a log message to the queue
     * @param skuTaskStepId The ID of the task step
     * @param content The log content to be written
     */
    public async addLog(skuTaskStepId: number, content: string): Promise<void> {
        this.queue.push({ skuTaskStepId, content });
        log.info(`Added log to queue for step ${skuTaskStepId}`);
    }

    /**
     * Start the queue processing
     */
    public startProcessing(): void {
        if (this.processingInterval) {
            return;
        }

        this.processingInterval = setInterval(async () => {
            if (this.isProcessing || this.queue.length === 0) {
                return;
            }

            await this.processNextLog();
        }, 1000); // Process every second
    }

    /**
     * Stop the queue processing
     */
    public stopProcessing(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }

    /**
     * Process the next log in the queue
     */
    private async processNextLog(): Promise<void> {
        if (this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const logEntry = this.queue.shift();

        try {
            if (logEntry) {
                log.info(`Processing log for step ${logEntry.skuTaskStepId}`);
                const stepLog = new SkuTaskStepLog(
                    undefined,
                    logEntry.skuTaskStepId,
                    logEntry.content
                );

                await createSkuTaskStepLog(stepLog);
                log.info(`Successfully processed log for step ${logEntry.skuTaskStepId}`);
            }
        } catch (error) {
            log.error(`Error processing log for step ${logEntry?.skuTaskStepId}:`, error);
            // Put the failed log back at the front of the queue
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Get the current queue size
     */
    public getQueueSize(): number {
        return this.queue.length;
    }

    /**
     * Clear the queue
     */
    public clearQueue(): void {
        this.queue = [];
    }
}

const stepLog = new StepLog();
stepLog.startProcessing();


export class StepLogMessage{
    public skuTaskStepId : number;
    public errorMessage : string | undefined;

    constructor(skuTaskStepId : number){
        this.skuTaskStepId = skuTaskStepId;
    }

    public appendErrorMessage(message : string) : void{
        if(!this.errorMessage){
            this.errorMessage = message;
        }else{
            this.errorMessage += "\n" + message;
        }
    }

    public sendLog() : void{
        if(!this.errorMessage || this.errorMessage.length === 0){
            return;
        }
        stepLog.addLog(this.skuTaskStepId, this.errorMessage);
        this.errorMessage = undefined;
    }

    public clearLog() : void{
        this.errorMessage = undefined;
    }
}

