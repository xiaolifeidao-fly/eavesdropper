import { StepUnit } from "../../step.unit";
import log from "electron-log"
import { Page } from "playwright";

export async function confirmProtocol(page: Page) {
    try {
        await page.waitForTimeout(1000);
        const protocolButtonElement = await page.evaluate(() => {
                //@ts-ignore
                const doc = document.querySelectorAll(".next-dialog-btn");
                if(!doc || doc.length == 0){
                    return false;
                }
                return true;
            });
            if(!protocolButtonElement){
                log.info("protocolButton not found");
                return;
            }
            const protocolButton = await page.locator(".next-dialog-btn");
            await protocolButton.first().click();
        } catch (e) {
            log.error("confirmProtocol error", e);
        }
}

export abstract class AbsPublishStep extends StepUnit{


}