import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";

export class InstallerApi extends ElectronApi {
    

    getApiName(): string {
        return "InstallerApi";
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

    //立即安装
    @InvokeType(Protocols.INVOKE)
    async install() {
        return await this.invokeApi("install");
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
