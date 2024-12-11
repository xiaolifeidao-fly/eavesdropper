import { ElectronApi } from "@eleapi/base";



export class TestApi extends ElectronApi {
    getApiName(): string {
        return "testApi"
    }

    test(text: string, num: number) {
        return text + num
    }


}