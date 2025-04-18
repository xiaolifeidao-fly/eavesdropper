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
            <el-form-item style="width: 30%;" label="用户名">
              <el-input v-model="listQuery.userName" />
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
            <el-form-item lstyle="width: 30%;" label="订单号">
              <el-input v-model="listQuery.orderRecordId" style="width: 200px;" placeholder="订单号" />
            </el-form-item>
            <el-form-item style="width: 30%;" label="">
              <el-button :loading="listLoading" @click="getOrderListInit()">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </el-card>
    <el-table v-loading="listLoading" :data="orderList" border fit highlight-current-row style="width: 100%">
      <el-table-column label="订单号" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单人" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createBy }}</span>
        </template>
      </el-table-column>
      <el-table-column label="租户" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tenantName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类目" width="90px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.shopCategoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="链接" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.businessId }}</span>
        </template>
      </el-table-column>
      <el-table-column v-for="(extParamModel, extParamModelIndex) in extParamModelList" :key="extParamModelIndex" :label="extParamModel.name" width="220px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.extParamModelList[extParamModelIndex].paramStr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单价" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单数量" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="初始数量" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.initNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束数量" width="80px" align="center">
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
      <el-table-column label="创建时间" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderCreateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderUpdateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="强制退单" align="center" width="80px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.visible0"
            placement="top"
            width="160"
            trigger="click"
          >
            <p>确定退单吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="closePop($index)">取消</el-button>
              <el-button type="primary" size="mini" @click="cancelOrder(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="row.orderStatusShow!='未开始' && row.orderStatusShow!='进行中' && row.orderStatusShow!='退单处理中' && row.orderStatusShow!='退单中'" size="mini" type="danger">
              退单
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="补款" align="center" width="80px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button :loading="bkLoading" size="mini" type="primary" :disabled="row.orderStatusShow!='已退单' && row.orderStatusShow!='已完成'" @click="showOrderReal(row)">
            补款
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="订单详情" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.visible1"
            placement="top"
            width="380"
            trigger="click"
          >
            <el-table :data="orderDetailList">
              <el-table-column width="150" label="详情">
                <template slot-scope="{row}">
                  <span>{{ row.description }}</span>
                </template>
              </el-table-column>
              <el-table-column width="180" label="操作时间">
                <template slot-scope="{row}">
                  <span>{{ row.operateTime }}</span>
                </template>
              </el-table-column>
            </el-table>
            <el-button slot="reference" size="mini" type="primary" @click="getOrderDetail(row,$index)">
              订单明细
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="图审" align="center" width="80px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button :loading="bkLoading" size="mini" type="primary" @click="taskCheckRough(row)">
            图审
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="执行图" align="center" width="80px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button :loading="bkLoading" size="mini" type="primary" @click="taskAllPics(row)">
            执行图
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getOrderList" />

    <el-dialog title="补款数量不能大于下单数量-实际数量" :visible.sync="orderRealdialogFormVisible" width="40%">
      <el-form ref="orderRealDataForm" :model="order" label-position="left" label-width="70px" style="width: 300px; margin-left:50px;">
        <el-form-item label="链接" @click.native="gotoDyUrl">
          <el-input v-model="order.businessId" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="初始值">
          <el-input v-model="order.initNum" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="当前值">
          <el-input v-model="order.endNum" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="下单数量">
          <el-input v-model="order.orderNum" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="实际数量">
          <el-input v-model="order.factNum" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="人工已审核" label-width="120px">
          <el-input v-model="order.rgApproveNum" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="人工未审核" label-width="120px">
          <el-input v-model="order.rgUnApproveNum" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="补款数量">
          <el-input v-model="order.bkNum" type="number" @input="caculateNumber" />
        </el-form-item>
      </el-form>
      <div v-show="false" class="dy-iframe">
        <iframe
          style="border:none;"
          width="800px"
          height="430px"
          :src="dyUrl"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="orderRealdialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" :disabled="bkButtonDisVisible" @click="reinForceOrder()">
          确定
        </el-button>
        <el-button type="primary" @click="openDyUrl()">
          打开链接
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOrderDetailList, getOrderManagerList, refundOrderForce, getOrderReal, reinForceOrder, queryXhsApi } from '@/api/order'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
// import axios from 'axios'
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
        '已退单': 'success'
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
      orderRecordId: undefined,
      orderList: [],
      extParamModelList: [],
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
        userName: '',
        orderRecordId: this.orderRecordId
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
      getOrderManagerList(this.listQuery).then(response => {
        this.orderList = response.data.items
        if (this.orderList.length > 0) {
          this.extParamModelList = this.orderList[0].extParamModelList
        }
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
    cancelOrder(row, index) {
      // this.temp = Object.assign({}, row) // copy obj
      // this.temp.status = '已退单'
      // this.list.splice(index, 1, this.temp)
      refundOrderForce(row.id).then(response => {
        this.getOrderList()
        this.$notify({
          title: '操作成功',
          message: '退单成功',
          type: 'success',
          duration: 2000
        })
        this.$set(this.list, index, Object.assign(this.list[index], { visible0: false }))
      })
    },
    getOrderDetail(row, index) {
      getOrderDetailList(row.id).then(response => {
        this.orderDetailList = response.data
      })
    },
    showOrderReal(row) {
      this.bkLoading = true
      return new Promise((resolve, reject) => {
        getOrderReal(row.id).then(response => {
          this.order = {}
          this.order = response.data
          this.order.bkNum = this.order.orderNum - this.order.factNum > 0 ? this.order.orderNum - this.order.factNum : 0
          if (this.order.bkNum > 0) {
            this.bkButtonDisVisible = false
          } else {
            this.bkButtonDisVisible = true
          }
          if (row.businessId.indexOf('http') >= 0) {
            this.dyUrl = row.businessId
          } else {
            this.dyUrl = 'https://www.iesdouyin.com/share/video/' + row.businessId + '/?region=CN&mid='
          }
          // 小红薯点赞 收藏 关注接口获取数据
          var shopName = row.shopName
          if (shopName.indexOf('红小') >= 0) {
            if (shopName.indexOf('点赞') >= 0) {
              queryXhsApi('/xhsapi/note/' + row.businessId).then(response => {
                var noteData = response.data
                this.order.factNum = noteData.likes - this.order.initNum
                this.orderRealdialogFormVisible = true
                this.bkLoading = false
              })
            }
            if (shopName.indexOf('收藏') >= 0) {
              queryXhsApi('/xhsapi/note/' + row.businessId).then(response => {
                var noteData = response.data
                this.order.factNum = noteData.collects - this.order.initNum
                this.orderRealdialogFormVisible = true
                this.bkLoading = false
              })
            }
            if (shopName.indexOf('关注') >= 0) {
              queryXhsApi('/xhsapi/note/' + row.businessId).then(response => {
                var noteData = response.data
                this.order.factNum = noteData.user.fans - this.order.initNum
                this.orderRealdialogFormVisible = true
                this.bkLoading = false
              })
              // this.proxyTest('https://www.xiaohongshu.com/fe_api/burdock/v1/note/' + row.businessId, function(data) {
              //   alert(data)
              // })
              // axios.get('/xhsapi/fe_api/burdock/v1/note/' + row.businessId, { // 这里会匹配到前面我们设置的/proxy，代替为https://www.tianqiapi.com
              //   params: {
              //   }
              // }).then(function(response) {
              //   console.log('zzzzzzzzzz')
              //   console.log(response)
              // }).catch(function(error) {
              //   console.log('xxxxxxxxxx')
              //   console.log(error)
              // })
            }
          }
          this.orderRealdialogFormVisible = true
          this.bkLoading = false
        }).catch(error => {
          this.bkLoading = false
          reject(error)
        })
      })
    },
    caculateNumber() {
      if (this.order.bkNum > this.order.orderNum - this.order.factNum || this.order.bkNum <= 0) {
        this.bkButtonDisVisible = true
      } else {
        this.bkButtonDisVisible = false
      }
    },
    reinForceOrder() {
      this.orderRealdialogFormVisible = false
      return new Promise((resolve, reject) => {
        reinForceOrder(this.order.id, this.order).then(response => {
          this.$notify({
            title: '操作成功',
            message: '补款已完成',
            type: 'success',
            duration: 2000
          })
        }).catch(error => {
          this.$notify({
            title: '操作失败',
            message: '同一订单不要进行多次退款',
            type: 'fail',
            duration: 2000
          })
          reject(error)
        })
      })
    },
    gotoDyUrl() {
      console.log('哈哈哈哈哈哈')
    },
    openDyUrl() {
      window.open(this.dyUrl)
    },
    taskCheckRough(row) {
      this.$router.push({
        path: '/check/taskRough',
        query: {
          orderId: row.id
        }
      })
    },
    taskAllPics(row) {
      // const routeUrl = this.$router.resolve({
      //   path: 'http://101.133.132.220:27855/#/picList',
      //   query: {
      //     orderHash: row.orderHash
      //   }
      // })
      window.open('http://101.133.132.220:27855/#/picList?orderHash=' + row.orderHash, '_blank')
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
