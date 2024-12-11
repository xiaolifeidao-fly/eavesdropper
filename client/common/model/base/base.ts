class BaseModel {
    constructor(
        public id: number,
        public name: string,
    ){
        this.id = id;
        this.name = name;
    }
}

export class PageInfo {
    constructor(
        public current: number,
        public pageSize: number,
        public total: number
    ) {
        this.current = current
        this.pageSize = pageSize
        this.total = total
    }
}

export class BasePageResp<T> {
    constructor(
        public data: T[],
        public pageInfo: PageInfo
    ) {
        this.data = data
        this.pageInfo = pageInfo
    }
}