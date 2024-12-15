// 用户分页请求
export class UserPageReq {
  constructor(
    public current: number,
    public pageSize: number,
    public mobile?: string,
  ) {
    this.mobile = mobile
    this.current = current
    this.pageSize = pageSize
  }
}

// 用户分页响应
export class UserPageResp {
  constructor(
    public id: number,
    public lastLoginAt: string,
    public nickname: string,
    public updatedAt: string,
    public mobile: string
  ) {
    this.id = id
    this.lastLoginAt = lastLoginAt
    this.nickname = nickname
    this.updatedAt = updatedAt
    this.mobile = mobile
  }
}