
export class FileData {
    fileId: string;
    folderId: string;
    pix: string;
    fileName: string;
    size: string;
    url: string;

    constructor(data: any){
        this.fileId = data.fileId;
        this.folderId = data.folderId;
        this.pix = data.pix;
        this.fileName = data.fileName;
        this.size = data.size;
        this.url = data.url;
    }
}
const data : FileData = {
    fileId: '1758908359650420822',
    folderId: '0',
    url: 'https://img.alicdn.com/imgextra/i2/695637589/O1CN01RLdhBD25vom2Cs3Z0_!!695637589.jpg',
    fileName: 'main_617843858963_0.jpg',
    size: '88388',
    pix: '800x800'
}

console.log(data);
  

