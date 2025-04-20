<template>
  <div class="tab-container" style="margin:1px;">
    <div class="filter-container">
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
      <el-tooltip class="item" effect="dark" content="输入作品短链,类似:https://v.douyin.com/o17xTJ/" placement="top">
        <el-input v-model="listQuery.tinyUrl" placeholder="链接" style="width: 200px;margin-top:5px;" class="filter-item" />
      </el-tooltip>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getOrderListInit">
        查询
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="clickCreateOrder">
        创建订单
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="orderList" border fit highlight-current-row style="width: 100%">
      <el-table-column label="订单号" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="租户" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tenantName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类目" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.shopCategoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column v-for="(extParamModel, extParamModelIndex) in extParamModelList" :key="extParamModelIndex" :label="extParamModel.name" width="220px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.extParamModelList[extParamModelIndex].paramStr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单数量" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绑定数量" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.endNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绑定详情" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="success" @click="showTokenDetail(row)">
            绑定详情
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.orderStatusShow | statusFilter">
            {{ row.orderStatusShow }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="退单" align="center" width="110px" class-name="small-padding fixed-width">
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
            <el-button slot="reference" :disabled="row.orderStatusShow!='未开始' && row.orderStatusShow!='进行中'" size="mini" type="danger">
              退单
            </el-button>
          </el-popover>
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
      <el-table-column label="创建时间" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderCreateTime }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getOrderList" />

    <el-dialog title="绑定详情" :visible.sync="tokenDetailDialogVisible" width="70%">
      <el-table v-loading="tokenListLoading" :data="tokenList" border fit highlight-current-row style="width: 100%">
        <el-table-column label="ID" width="80px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Token" width="220px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.token }}</span>
          </template>
        </el-table-column>
        <el-table-column label="外部ID" width="120px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.tbExternalId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="店铺名称" width="150px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.tbShopName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="店铺ID" width="120px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.tbShopId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100px" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.status | statusBindFilter">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="绑定时间" width="160px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.bindTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.tokenCreateTime }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="tokenTotal>0" :total="tokenTotal" :page.sync="tokenListQuery.page" :limit.sync="tokenListQuery.limit" @pagination="getTokens" />
    </el-dialog>

    <el-dialog title="创建订单" :visible.sync="createOrderdialogFormVisible">
      <el-form ref="orderDataForm" :rules="rules" :model="order" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item v-if="tenantVisible" label="租户" prop="tenantId">
          <el-select v-model="order.tenantId" class="filter-item" placeholder="租户" @change="tenantChange">
            <el-option
              v-for="item in currentTenantOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品">
          <el-input v-model="order.shopName" :autosize="{ minRows: 2, maxRows: 4}" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="类目">
          <el-input v-model="order.shopCategoryName" :autosize="{ minRows: 2, maxRows: 4}" type="text" :disabled="true" />
        </el-form-item>
        <div v-for="(shopExtParamSelect, shopExtParamSelectIndex) in shopExtParamSelectList" :key="shopExtParamSelectIndex">
          <el-form-item :label="shopExtParamSelect.name">
            <el-select v-model="shopExtParamSelect.id" class="filter-item" :placeholder="shopExtParamSelect.name" @change="shopExtParamSelectChange">
              <el-option
                v-for="item in shopExtParamSelect.shopExtParamOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
        <div v-for="(shopExtParamInput, shopExtParamInputIndex) in shopExtParamInputList" :key="shopExtParamInputIndex">
          <el-form-item :label="shopExtParamInput.name">
            <el-input v-model="shopExtParamInput.text" :autosize="{ minRows: 2, maxRows: 4}" type="text" />
          </el-form-item>
        </div>
        <el-form-item label="单价" prop="price">
          <el-input v-model="order.price" :autosize="{ minRows: 2, maxRows: 4}" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="数量" prop="orderNum">
          <el-input v-model="order.orderNum" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入下单数量" @input="caculateAmount" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model="order.amount" :autosize="{ minRows: 2, maxRows: 4}" type="text" :disabled="true" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createOrderdialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createOrder()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getCurrentTenantList } from '@/api/user'
import { getShopList, getCategoryList, getTenantShopListByTenantId, getShopExtParamList } from '@/api/shop'
import { getOrderList, createOrder, getOrderDetailList, refundOrder, getTokenList } from '@/api/order'
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
    },
    statusBindFilter(status) {
      const statusMap = {
        '未绑定': 'info',
        '绑定中': '',
        '已绑定': 'success',
        '绑定失败': 'danger',
        '授权过期': 'warning',
        '已解绑': 'info',
        '已禁用': 'danger'
      }
      return statusMap[status]
    }
  },
  props: {
    shopId: {
      type: String,
      default: '0'
    },
    shop: {
      type: Object,
      default: {}
    },
    shopCategoryId: {
      type: String,
      default: '0'
    },
    shopCategory: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      total: 0,
      orderList: [],
      extParamModelList: [],
      orderDetailList: [],
      currentTenantList: [],
      currentTenantOptions: [],
      shopList: [],
      shopOptions: [],
      shopCategoryList: [],
      shopCategoryOptions: [],
      shopExtParamList: [],
      shopExtParamInputList: [],
      shopExtParamSelectList: [],
      listQuery: {
        page: 1,
        limit: 10,
        shopCategoryId: this.shopCategoryId,
        sort: '+id',
        startTime: null,
        endTime: null,
        tinyUrl: ''
      },
      order: {
        tenantId: undefined,
        tenantName: '',
        shopId: undefined,
        shopCategoryId: undefined,
        shopName: '',
        shopCategoryName: '',
        userId: undefined,
        initNum: undefined,
        endNum: undefined,
        orderStatus: '',
        orderStatusShow: '',
        orderNum: undefined,
        orderAmount: undefined,
        price: undefined,
        businessId: '',
        startTime: '',
        endTime: '',
        orderRecordExtParamModelList: []
      },
      rules: {
        tenantId: [{ required: true, message: '租户不能为空', trigger: 'change' }],
        shopId: [{ required: true, message: '商品不能为空', trigger: 'change' }],
        shopCategoryId: [{ required: true, message: '类目不能为空', trigger: 'change' }],
        businessId: [{ required: true, message: '链接不能为空', trigger: 'change' }],
        orderNum: [{ required: true, message: '数量不能为空', trigger: 'change' }],
        price: [{ required: true, message: '单价不能为空', trigger: 'change' }],
        amount: [{ required: true, message: '总价不能为空', trigger: 'change' }]
      },
      tenantVisible: false,
      shopVisible: false,
      listLoading: false,
      createOrderdialogFormVisible: false,
      timeRange: '',
      pickerOptions: {
        shortcuts: [{
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
      },
      tokenDetailDialogVisible: false,
      tokenListLoading: false,
      tokenList: [],
      tokenTotal: 0,
      currentOrderId: null,
      tokenListQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  created() {
    this.getOrderList()
    this.getCurrentTenantList()
  },
  methods: {
    getOrderList() {
      this.listLoading = true
      this.listQuery.startTime = this.timeRange[0]
      this.listQuery.endTime = this.timeRange[1]
      getOrderList(this.listQuery).then(response => {
        this.orderList = response.data.items
        if (this.orderList.length > 0) {
          this.extParamModelList = this.orderList[0].extParamModelList
        }
        console.log('HHHHHHHH')
        console.log(this.extParamModelList)
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
    getCurrentTenantList() {
      if (this.currentTenantList.length === 0) {
        getCurrentTenantList().then(response => {
          this.currentTenantList = response.data.items
          this.currentTenantOptions = []
          this.currentTenantList.forEach((value, index) => {
            const option = {}
            option.value = value.id
            option.label = value.name
            this.currentTenantOptions.push(option)
          })
        })
      }
    },
    getShopCategoryListAndShopExtParamList(shopCategoryId) {
      this.getShopCategoryList(shopCategoryId)
      this.getShopExtParamList(shopCategoryId)
    },
    getShopExtParamList(shopCategoryId) {
      getShopExtParamList(shopCategoryId).then(response => {
        this.shopExtParamList = response.data
        this.shopExtParamSelectList = []
        this.shopExtParamInputList = []
        this.shopExtParamList.forEach((value, index) => {
          var candidateValuesList = []
          var shopExtParamOptions = []
          candidateValuesList = value.candidateValuesList
          candidateValuesList.forEach((value, index) => {
            const option = {}
            option.value = value.key
            option.label = value.value
            shopExtParamOptions.push(option)
          })
          value.shopExtParamOptions = shopExtParamOptions
          value.value = ''
          if (shopExtParamOptions.length > 0) {
            this.shopExtParamSelectList.push(value)
          } else {
            this.shopExtParamInputList.push(value)
          }
        })
      })
    },
    cancelOrder(row, index) {
      // this.temp = Object.assign({}, row) // copy obj
      // this.temp.status = '已退单'
      // this.list.splice(index, 1, this.temp)
      refundOrder(row.id).then(response => {
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
    tenantChange() {
      this.order.shopCategoryId = undefined
      getTenantShopListByTenantId(this.order.tenantId).then(response => {
        this.shopList = response.data
        this.shopOptions = []
        this.shopList.forEach((value, index) => {
          const option = {}
          option.value = value.id
          option.label = value.name
          this.shopOptions.push(option)
        })
      })
    },
    shopCategoryChangeShopExtParamList(shopCategoryId) {
      this.getShopExtParamList(shopCategoryId)
    },
    caculateAmount() {
      this.order.amount = this.accMul(this.order.price, this.order.orderNum)
    },
    accMul(arg1, arg2) {
      var m = 0; var s1 = arg1.toString(); var s2 = arg2.toString()
      try { m += s1.split('.')[1].length } catch (e) {
        console.log('accMul-error1')
      }
      try { m += s2.split('.')[1].length } catch (e) {
        console.log('accMul-error1')
      }
      return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m)
    },
    clickCreateOrder() {
      this.createOrderdialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['orderDataForm'].clearValidate()
      })
      getCurrentTenantList()
      if (this.currentTenantList.length <= 1) {
        this.tenantVisible = false
        this.shopVisible = false
        this.order.tenantId = this.currentTenantList[0].id
      } else {
        this.tenantVisible = true
        this.shopVisible = true
      }
      this.order.shopCategoryId = this.shopCategoryId
      this.order.shopId = this.shopId
      this.order.shopName = this.shop.name
      this.order.shopCategoryName = this.shopCategory.name
      this.order.price = this.shopCategory.price
    },
    createOrder() {
      this.order.orderRecordExtParamModelList = []
      this.shopExtParamInputList.forEach((value, index) => {
        const extParam = {}
        extParam.shopExtParamId = value.shopExtParamId
        extParam.value = value.text
        this.order.orderRecordExtParamModelList.push(extParam)
      })
      this.shopExtParamSelectList.forEach((value, index) => {
        const extParam = {}
        extParam.shopExtParamId = value.shopExtParamId
        extParam.value = value.text
        this.order.orderRecordExtParamModelList.push(extParam)
      })
      this.$refs['orderDataForm'].validate((valid) => {
        if (valid) {
          this.createOrderdialogFormVisible = false
          createOrder(this.order).then(response => {
            this.getOrderList()
            this.$notify({
              title: '操作成功',
              message: '下单已完成',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    getOrderDetail(row, index) {
      getOrderDetailList(row.id).then(response => {
        this.orderDetailList = response.data
      })
    },
    showTokenDetail(row) {
      this.currentOrderId = row.id
      this.tokenDetailDialogVisible = true
      this.getTokens()
    },
    getTokens() {
      this.tokenListLoading = true
      getTokenList(this.currentOrderId, this.tokenListQuery).then(response => {
        this.tokenList = response.data.items
        this.tokenTotal = response.data.total
        setTimeout(() => {
          this.tokenListLoading = false
        }, 1.5 * 1)
      })
    }
  }
}
</script>
