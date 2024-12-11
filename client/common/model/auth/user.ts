// 用户分页响应
export class UserPageResp {
  constructor(
    public id: number,
    public lastLoginAt: string,
    public nickname: string,
    public updatedAt: string,
    public username: string
  ) {
    this.id = id
    this.lastLoginAt = lastLoginAt
    this.nickname = nickname
    this.updatedAt = updatedAt
    this.username = username
  }
}
