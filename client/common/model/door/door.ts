
export class ActionCommand {
    key : string;
    code: string;
    version: string;

    constructor(key: string, code: string, version: string) {
        this.key = key;
        this.code = code;
        this.version = version;
    }
}


export class DoorFileRecord {
    id: number|undefined;
    source: string|undefined;
    fileId: string|undefined;
    resourceId: number|undefined;
    fileType: string|undefined;
    fileName: string|undefined;
    fileUrl: string|undefined;
    fileSize: number|undefined;
    folderId: string|undefined;
    fileKey: string|undefined;
    pix: string|undefined;

    constructor(id?: number, source?: string, fileId?: string, resourceId?: number, fileType?: string, fileName?: string, fileUrl?: string, fileSize?: number, folderId?: string, fileKey?: string, pix?: string) {
        this.id = id;
        this.source = source;
        this.fileId = fileId;
        this.resourceId = resourceId;
        this.fileType = fileType;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileSize = fileSize;
        this.folderId = folderId;
        this.fileKey = fileKey;
        this.pix = pix;
    }
}

export class DoorRecord {
    id: number | undefined;
    doorKey: string;
    url: string;
    itemKey: string;
    type: string;
    data: string;

    constructor(id: number | undefined, doorKey: string, url: string, itemKey: string, type: string, data: string) {
        this.id = id;
        this.doorKey = doorKey;
        this.url = url;
        this.itemKey = itemKey;
        this.type = type;
        this.data = data;
    }
}