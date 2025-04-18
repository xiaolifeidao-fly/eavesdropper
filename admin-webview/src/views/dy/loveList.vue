<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.tenantId" class="filter-item" placeholder="请选择租户">
        <el-option
          v-for="item in currentTenantOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="editOrder">
        创建订单
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="租户" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tenantName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类目" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tenantShopName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="链接" width="220px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.businessId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="初始数量" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.initNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束数量" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.endNum }}</span>
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
            width="500"
            trigger="click"
          >
            <el-table :data="orderDetailList">
              <el-table-column width="100" label="操作人">
                <template slot-scope="{row}">
                  <span>{{ row.updateBy }}</span>
                </template>
              </el-table-column>
              <el-table-column width="150" label="详情">
                <template slot-scope="{row}">
                  <span>{{ row.description }}</span>
                </template>
              </el-table-column>
              <el-table-column width="180" label="操作时间">
                <template slot-scope="{row}">
                  <span>{{ row.updateTime }}</span>
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
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="创建订单" :visible.sync="createOrderdialogFormVisible">
      <el-form ref="orderDataForm" :rules="rules" :model="order" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="租户" prop="tenantId">
          <el-select v-model="order.tenantId" class="filter-item" placeholder="租户" @change="tenantChange">
            <el-option
              v-for="item in currentTenantOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品" prop="tenantShopId">
          <el-select v-model="order.tenantShopId" class="filter-item" placeholder="商品" @change="tenantShopChange">
            <el-option
              v-for="item in tenantShopOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input v-model="order.price" :autosize="{ minRows: 2, maxRows: 4}" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="链接" prop="businessId">
          <el-input v-model="order.businessId" :autosize="{ minRows: 2, maxRows: 4}" type="text" />
        </el-form-item>
        <el-form-item label="数量" prop="orderNum">
          <el-input v-model="order.orderNum" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入下单数量" @input="caculateAmount" />
        </el-form-item>
        <el-form-item label="价格" prop="amount">
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
import { getTenantShopListByTenantId } from '@/api/shop'
import { getOrderList, createOrder, getOrderDetailList, refundOrder } from '@/api/order'
import { getCurrentTenantList } from '@/api/user'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
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
  data() {
    return {
      tableKey: 0,
      list: [],
      orderDetailList: [],
      total: 0,
      currentTenantList: [],
      currentTenantOptions: [],
      tenantShopList: [],
      tenantShopOptions: [],
      listLoading: true,
      listQuery: {
        tenantId: '',
        page: 1,
        limit: 10,
        sort: '+id'
      },
      createOrderdialogFormVisible: false,
      temp: {
        id: undefined,
        username: '',
        orderAmount: undefined,
        initNum: undefined,
        endNum: undefined,
        status: ''
      },
      order: {
        tenantId: undefined,
        tenantShopId: undefined,
        businessId: '',
        price: undefined,
        orderNum: undefined,
        amount: undefined
      },
      rules: {
        tenantId: [{ required: true, message: '租户不能为空', trigger: 'change' }],
        tenantShopId: [{ required: true, message: '商品不能为空', trigger: 'change' }],
        businessId: [{ required: true, message: '链接不能为空', trigger: 'change' }],
        orderNum: [{ required: true, message: '数量不能为空', trigger: 'change' }],
        price: [{ required: true, message: '单价不能为空', trigger: 'change' }],
        amount: [{ required: true, message: '总价不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.getCurrentTenantList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getOrderList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.list.forEach((value, index) => {
          Object.assign(value, { visible0: false })
          Object.assign(value, { visible1: false })
          const delayTime = new Date(value.createTime).toJSON()
          value.createTime = new Date(
            +new Date(delayTime) + 8 * 3600 * 1000)
            .toISOString()
            .replace(/T/g, ' ')
            .replace(/\.[\d]{3}Z/, '')
        })
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getCurrentTenantList() {
      if (this.currentTenantList.length === 0) {
        getCurrentTenantList().then(response => {
          this.currentTenantList = response.data.items
          this.currentTenantList.forEach((value, index) => {
            const option = {}
            option.value = value.id
            option.label = value.name
            this.currentTenantOptions.push(option)
          })
        })
      }
    },
    tenantChange() {
      getTenantShopListByTenantId(this.order.tenantId).then(response => {
        this.tenantShopList = response.data
        this.tenantShopList.forEach((value, index) => {
          const option = {}
          option.value = value.id
          option.label = value.shopName
          this.tenantShopOptions.push(option)
        })
      })
    },
    tenantShopChange() {
      this.tenantShopList.forEach((value, index) => {
        if (value.id === this.order.tenantShopId) {
          this.order.price = value.price
        }
      })
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
    caculateAmount() {
      this.order.amount = this.accMul(this.order.price, this.order.orderNum)
    },
    closePop(index) {
      this.$set(this.list, index, Object.assign(this.list[index], { visible0: false }))
    },
    cancelOrder(row, index) {
      // this.temp = Object.assign({}, row) // copy obj
      // this.temp.status = '已退单'
      // this.list.splice(index, 1, this.temp)
      refundOrder(row.id).then(response => {
        this.getList()
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
        this.orderDetailList.forEach((value, index) => {
          const delayTime = new Date(value.updateTime).toJSON()
          value.updateTime = new Date(
            +new Date(delayTime) + 8 * 3600 * 1000)
            .toISOString()
            .replace(/T/g, ' ')
            .replace(/\.[\d]{3}Z/, '')
        })
      })
    },
    editOrder() {
      this.createOrderdialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['orderDataForm'].clearValidate()
      })
    },
    createOrder() {
      this.$refs['orderDataForm'].validate((valid) => {
        if (valid) {
          this.createOrderdialogFormVisible = false
          createOrder(this.order).then(response => {
            this.getList()
            this.$notify({
              title: '操作成功',
              message: '下单已完成',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    }
  }
}
</script>
