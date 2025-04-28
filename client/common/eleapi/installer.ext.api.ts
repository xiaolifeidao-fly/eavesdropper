import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";

export class InstallerExtApi extends ElectronApi {
    

    getApiName(): string {
        return "InstallerExtApi";
    }

    //立即更新
    @InvokeType(Protocols.INVOKE)
    async update() {
        return await this.invokeApi("update");
    }

    //取消更新
    @InvokeType(Protocols.INVOKE)
    async cancelUpdate() {
        return await this.invokeApi("cancelUpdate");
    }

    //取消更新
    @InvokeType(Protocols.INVOKE)
    async finsihInstall() {
        return await this.invokeApi("finsihInstall");
    }

    @InvokeType(Protocols.TRRIGER)
    async onMonitorDownloadProgress(callback : (progress : number) => void){
        return await this.onMessage("onMonitorDownloadProgress", callback);
    }

    @InvokeType(Protocols.TRRIGER)
    async onMonitorUpdateDownloaded(callback : (version : string, releaseNotes : any) => void){
        return await this.onMessage("onMonitorUpdateDownloaded", callback);
    }

    @InvokeType(Protocols.TRRIGER)
    async onMonitorUpdateDownloadedError(callback : (error : any) => void){
        return await this.onMessage("onMonitorUpdateDownloadedError", callback);
    }


}
