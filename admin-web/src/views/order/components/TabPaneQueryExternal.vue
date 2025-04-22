<template>
  <div class="tab-container" style="margin:1px;">
    <el-card class="box-card">
      <section class="card-content caling-info">
        <div class="base-info">
          <el-form class="el-form-query" label-width="80px">
            <el-form-item style="width: 30%;" label="时间范围">
              <el-date-picker
                v-model="timeRange"
                value-format="yyyy-MM-dd HH:mm:SS"
                type="datetimerange"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right"
              />
            </el-form-item>
            <el-form-item style="visibility:hidden;" label="管理key">
              <el-input />
            </el-form-item>
            <el-form-item style="width: 30%;" label="状态">
              <el-select v-model="listQuery.orderStatusShow" placeholder="请选择">
                <el-option
                  v-for="item in orderStatusList"
                  :key="item.value"
                  :label="item.value"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item lstyle="width: 30%;" label="链接">
              <el-input v-model="listQuery.tinyUrl" style="width: 200px;" placeholder="作品短链" />
            </el-form-item>
            <el-form-item style="width: 30%;" label="">
              <el-button :loading="listLoading" @click="getOrderListInit()">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </el-card>
    <el-table v-loading="listLoading" :data="orderList" border fit highlight-current-row style="width: 100%">
      <el-table-column label="ID" width="70px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类目" width="90px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.shopCategoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单数量" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绑定数量" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.endNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" width="80px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.orderStatusShow | statusFilter">
            {{ row.orderStatusShow }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderCreateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderUpdateTime }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getOrderList" />

  </div>
</template>

<script>
import { getOrderExternalList } from '@/api/order'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '初始化中': 'info',
        '未开始': 'info',
        '进行中': '',
        '已完成': 'success',
        '处理失败': 'danger',
        '退单中': '',
        '退单处理中': '',
        '退单成功': 'success',
        '退单失败': 'danger'
      }
      return statusMap[status]
    }
  },
  props: {
    shopCategoryId: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      dyUrl: '',
      total: 0,
      orderList: [],
      orderDetailList: [],
      currentTenantList: [],
      currentTenantOptions: [],
      shopList: [],
      shopOptions: [],
      shopCategoryList: [],
      shopCategoryOptions: [],
      orderStatusList: [{ 'value': '初始化中' }, { 'value': '未开始' }, { 'value': '进行中' },
        { 'value': '已完成' }, { 'value': '处理失败' }, { 'value': '退单中' }, { 'value': '退单处理中' }, { 'value': '已退单' }],
      listQuery: {
        page: 1,
        limit: 20,
        shopCategoryId: this.shopCategoryId,
        sort: '+id',
        startTime: null,
        endTime: null,
        tinyUrl: '',
        orderStatusShow: '',
        userName: ''
      },
      order: {
        id: undefined,
        tenantId: undefined,
        tenantName: '',
        shopCategoryId: undefined,
        shopName: '',
        shopCategoryName: '',
        userId: undefined,
        initNum: undefined,
        endNum: undefined,
        orderStatus: '',
        orderStatusShow: '',
        orderNum: undefined,
        factNum: undefined,
        orderAmount: undefined,
        price: undefined,
        businessId: '',
        bkNum: undefined,
        startTime: '',
        endTime: ''
      },
      tenantVisible: false,
      shopVisible: false,
      listLoading: false,
      orderRealdialogFormVisible: false,
      bkButtonDisVisible: true,
      bkLoading: false,
      timeRange: '',
      pickerOptions: {
        shortcuts: [{
          text: '昨天',
          onClick(picker) {
            const end = new Date(new Date().toLocaleDateString())
            const start = new Date(new Date().toLocaleDateString())
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '今天',
          onClick(picker) {
            const end = new Date(new Date().toLocaleDateString())
            const start = new Date(new Date().toLocaleDateString())
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    getOrderList() {
      this.listLoading = true
      this.listQuery.startTime = this.timeRange[0]
      this.listQuery.endTime = this.timeRange[1]
      getOrderExternalList(this.listQuery).then(response => {
        this.orderList = response.data.items
        this.total = response.data.total
        this.orderList.forEach((value, index) => {
          Object.assign(value, { visible0: false })
          Object.assign(value, { visible1: false })
        })
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    getOrderListInit() {
      this.listQuery.page = 1
      this.getOrderList()
    },
    gotoDyUrl() {
      console.log('哈哈哈哈哈哈')
    }
  }
}
</script>
<style lang="scss" scoped>
  >>> .el-input.is-disabled .el-input__inner {
      color: #000000 !important;
  }
  .dy-iframe {
    position: absolute;
    background:#FFFFFF;
    width: 400px;
    height: 430px;
    left:400px;
    top: 40px;
  }
  .base-info {
    width: 70%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .el-form-query {
      width: 100%;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
  }
  .calling-icon {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    line-height: 40px;
    text-align: center;
    font-size: 32px;
    background: green;
    color: #fff;
    margin-right: 80px;
  }
  .recording-infos {
    width: 100%;
  }
  .content-textarea {
    width: 100%;
  }
  .el-card {
    margin-bottom: 5px;
  }

</style>
