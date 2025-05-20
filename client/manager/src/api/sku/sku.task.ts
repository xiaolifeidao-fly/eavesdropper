import { BasePageResp, LabelValue } from "@/common/base"
import { instance } from "@/utils/axios"
import { plainToClass } from "class-transformer"

export class SkuTaskPageReq {
    constructor(
      public current: number,
      public pageSize: number,
      public shopName?: string,
      public skuName?: string
    ) {
      this.current = current
      this.pageSize = pageSize
      this.shopName = shopName
      this.skuName = skuName
    }
  }
  
  export class SkuTaskPageResp {
    constructor(
      public id: number,
      public resourceId: number,
      public resourceAccount: string,
      public status: string,
      public statusLableValue: LabelValue,
      public source: string,
      public sourceLableValue: LabelValue,
      public count: number,
      public createdBy: string,
      public createdAt: string,
      public shopName: string,
      public successCount: number,
      public failedCount: number,
      public cancelCount: number,
      public existenceCount: number,
      public expirationDate: string,
      public resourceStatus: string,
    ) {
      this.id = id
      this.resourceId = resourceId
      this.resourceAccount = resourceAccount
      this.status = status
      this.statusLableValue = statusLableValue
      this.source = source
      this.sourceLableValue = sourceLableValue
      this.count = count
      this.createdBy = createdBy
      this.createdAt = createdAt
      this.shopName = shopName
      this.successCount = successCount
      this.failedCount = failedCount
      this.cancelCount = cancelCount
      this.existenceCount = existenceCount
      this.expirationDate = expirationDate
      this.resourceStatus = resourceStatus
    }
  }
  
  export class SkuTaskItemResp {
    constructor(
      public id: number,
      public taskId: number,
      public url: string,
      public status: string,
      public remark: string,
      public skuId: number,
      public name: string,
      public sourceSkuId: string,
      public source: string,
      public sourceLableValue: LabelValue,
      public createdAt: string,
      public newSkuUrl: string,
      public title: string
    ) {
      this.id = id
      this.taskId = taskId
      this.url = url
      this.status = status
      this.remark = remark
      this.skuId = skuId
      this.name = name
      this.sourceSkuId = sourceSkuId
      this.source = source
      this.sourceLableValue = sourceLableValue
      this.createdAt = createdAt
      this.newSkuUrl = newSkuUrl
      this.title = title
    }
  }
  
  export const STEP_INIT = "INIT"
  export const STEP_PENDING = "PENDING"
  export const STEP_DONE = "DONE"
  export const STEP_ROLLBACK = "ROLLBACK"
  export const STEP_ERROR = "ERROR"

// 模拟数据
const mockSkuTaskList: SkuTaskPageResp[] = [
  new SkuTaskPageResp(
    1, 
    1001, 
    'account1', 
    'pending', 
    {label: '待处理', value: 'pending', color: 'orange'}, 
    'taobao', 
    {label: '淘宝', value: 'taobao', color: 'blue'}, 
    10, 
    'admin', 
    '2023-05-15 12:30:00', 
    '淘宝商城旗舰店', 
    0, 
    0, 
    0, 
    0, 
    '2023-12-31', 
    'active'
  ),
  new SkuTaskPageResp(
    2, 
    1002, 
    'account2', 
    'running', 
    {label: '进行中', value: 'running', color: 'blue'}, 
    'jd', 
    {label: '京东', value: 'jd', color: 'red'}, 
    15, 
    'admin', 
    '2023-05-16 10:20:00', 
    '京东自营店', 
    5, 
    2, 
    0, 
    0, 
    '2023-12-31', 
    'active'
  ),
  new SkuTaskPageResp(
    3, 
    1003, 
    'account3', 
    'done', 
    {label: '已完成', value: 'done', color: 'green'}, 
    'tmall', 
    {label: '天猫', value: 'tmall', color: 'red'}, 
    8, 
    'admin', 
    '2023-05-14 14:45:00', 
    '天猫旗舰店', 
    8, 
    0, 
    0, 
    0, 
    '2023-12-31', 
    'active'
  ),
  new SkuTaskPageResp(
    4, 
    1004, 
    'account4', 
    'failed', 
    {label: '失败', value: 'failed', color: 'red'}, 
    'pdd', 
    {label: '拼多多', value: 'pdd', color: 'orange'}, 
    12, 
    'admin', 
    '2023-05-17 09:15:00', 
    '拼多多商城', 
    3, 
    9, 
    0, 
    0, 
    '2023-12-31', 
    'active'
  ),
  new SkuTaskPageResp(
    5, 
    1005, 
    'account5', 
    'stop', 
    {label: '已停止', value: 'stop', color: 'gray'}, 
    'amazon', 
    {label: '亚马逊', value: 'amazon', color: 'black'}, 
    20, 
    'admin', 
    '2023-05-13 16:50:00', 
    '亚马逊中国', 
    10, 
    5, 
    5, 
    0, 
    '2023-12-31', 
    'active'
  ),
];

// 模拟任务项数据，每个任务ID对应不同的任务项列表
const mockTaskItemsMap: Record<number, SkuTaskItemResp[]> = {
  1: [
    new SkuTaskItemResp(101, 1, 'https://example.com/item1', 'pending', '等待处理', 501, '商品1', 'SKU001', 'taobao', {label: '淘宝', value: 'taobao', color: 'blue'}, '2023-05-15 12:35:00', 'https://example.com/newsku1', '商品发布任务'),
    new SkuTaskItemResp(102, 1, 'https://example.com/item2', 'pending', '等待处理', 502, '商品2', 'SKU002', 'taobao', {label: '淘宝', value: 'taobao', color: 'blue'}, '2023-05-15 12:36:00', 'https://example.com/newsku2', '商品更新任务'),
  ],
  2: [
    new SkuTaskItemResp(201, 2, 'https://example.com/item3', 'success', '处理成功', 503, '商品3', 'SKU003', 'jd', {label: '京东', value: 'jd', color: 'red'}, '2023-05-16 10:25:00', 'https://example.com/newsku3', '商品发布任务'),
    new SkuTaskItemResp(202, 2, 'https://example.com/item4', 'success', '处理成功', 504, '商品4', 'SKU004', 'jd', {label: '京东', value: 'jd', color: 'red'}, '2023-05-16 10:26:00', 'https://example.com/newsku4', '商品更新任务'),
    new SkuTaskItemResp(203, 2, 'https://example.com/item5', 'failed', '处理失败', 505, '商品5', 'SKU005', 'jd', {label: '京东', value: 'jd', color: 'red'}, '2023-05-16 10:27:00', 'https://example.com/newsku5', '商品重发任务'),
  ],
  3: [
    new SkuTaskItemResp(301, 3, 'https://example.com/item6', 'success', '处理成功\n 123 \n 333', 506, '商品6', 'SKU006', 'tmall', {label: '天猫', value: 'tmall', color: 'red'}, '2023-05-14 14:50:00', 'https://example.com/newsku6', '商品发布任务'),
    new SkuTaskItemResp(302, 3, 'https://example.com/item7', 'success', '处理成功', 507, '商品7', 'SKU007', 'tmall', {label: '天猫', value: 'tmall', color: 'red'}, '2023-05-14 14:51:00', 'https://example.com/newsku7', '商品更新任务'),
  ],
  4: [
    new SkuTaskItemResp(401, 4, 'https://example.com/item8', 'success', '处理成功', 508, '商品8', 'SKU008', 'pdd', {label: '拼多多', value: 'pdd', color: 'orange'}, '2023-05-17 09:20:00', 'https://example.com/newsku8', '商品发布任务'),
    new SkuTaskItemResp(402, 4, 'https://example.com/item9', 'failed', '处理失败', 509, '商品9', 'SKU009', 'pdd', {label: '拼多多', value: 'pdd', color: 'orange'}, '2023-05-17 09:21:00', 'https://example.com/newsku9', '商品更新任务'),
    new SkuTaskItemResp(403, 4, 'https://example.com/item10', 'failed', '处理失败', 510, '商品10', 'SKU010', 'pdd', {label: '拼多多', value: 'pdd', color: 'orange'}, '2023-05-17 09:22:00', 'https://example.com/newsku10', '商品重发任务'),
  ],
  5: [
    new SkuTaskItemResp(501, 5, 'https://example.com/item11', 'success', '处理成功', 511, '商品11', 'SKU011', 'amazon', {label: '亚马逊', value: 'amazon', color: 'black'}, '2023-05-13 16:55:00', 'https://example.com/newsku11', '商品发布任务'),
    new SkuTaskItemResp(502, 5, 'https://example.com/item12', 'failed', '处理失败', 512, '商品12', 'SKU012', 'amazon', {label: '亚马逊', value: 'amazon', color: 'black'}, '2023-05-13 16:56:00', 'https://example.com/newsku12', '商品更新任务'),
    new SkuTaskItemResp(503, 5, 'https://example.com/item13', 'cancel', '已取消', 513, '商品13', 'SKU013', 'amazon', {label: '亚马逊', value: 'amazon', color: 'black'}, '2023-05-13 16:57:00', 'https://example.com/newsku13', '商品重发任务'),
  ],
};

// 判断是否使用模拟数据
const USE_MOCK_DATA = true;

// 分页获取商品任务
export const getSkuTaskPage = async (req: SkuTaskPageReq) => {
  if (USE_MOCK_DATA) {
    // 过滤数据
    let filteredData = [...mockSkuTaskList];
    
    if (req.shopName) {
      filteredData = filteredData.filter(item => 
        item.shopName.toLowerCase().includes(req.shopName!.toLowerCase())
      );
    }
    
    if (req.skuName) {
      // 这里仅做示例，实际上我们没有skuName字段，可以根据实际情况调整
      filteredData = filteredData.filter(item => 
        item.resourceAccount.toLowerCase().includes(req.skuName!.toLowerCase())
      );
    }
    
    // 分页
    const start = (req.current - 1) * req.pageSize;
    const end = start + req.pageSize;
    const paginatedData = filteredData.slice(start, end);
    
    // 创建分页结果
    const pageInfo = {
      current: req.current,
      pageSize: req.pageSize,
      total: filteredData.length
    };
    
    const result = {
      data: paginatedData,
      pageInfo: pageInfo
    };
    
    return plainToClass(BasePageResp<SkuTaskPageResp>, result);
  } else {
    // 实际API调用
    const result = await instance.get(`/sku/task/page`, { params: req });
    return plainToClass(BasePageResp<SkuTaskPageResp>, result);
  }
}

// 获取商品任务项
export const getSkuTaskItemByTaskId = async (taskId: number) => {
  if (USE_MOCK_DATA) {
    // 返回模拟数据
    return mockTaskItemsMap[taskId] || [];
  } else {
    // 实际API调用
    const result = await instance.get(`/sku/task/${taskId}/item`);
    return plainToClass(Array<SkuTaskItemResp>, result);
  }
}
  