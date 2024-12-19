
export class ActionCommand {
    code: string;
    version: string;

    constructor(code: string, version: string) {
        this.code = code;
        this.version = version;
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