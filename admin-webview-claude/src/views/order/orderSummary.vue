<template>
  <div class="tab-container">
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
            <el-form-item style="width: 30%;" label="商品">
              <el-select v-model="listQuery.businessType" placeholder="请选择">
                <el-option
                  v-for="item in options"
                  :key="item.label"
                  :label="item.value"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
            <el-form-item style="visibility:hidden;" label="管理key">
              <el-input />
            </el-form-item>
            <el-form-item style="width: 30%;" label="">
              <el-button type="primary" icon="el-icon-search" @click="getList">
                查询
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </el-card>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="类目" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="退单条数" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.refundOrders }}</span>
        </template>
      </el-table-column>
      <el-table-column label="退单总量" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.refundCounts }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成条数" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.doneOrders }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成总量" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.doneCounts }}</span>
        </template>
      </el-table-column>
      <el-table-column label="补单条数" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.bkOrders }}</span>
        </template>
      </el-table-column>
      <el-table-column label="补单总量" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.bkCounts }}</span>
        </template>
      </el-table-column>
      <el-table-column label="累计" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.refundCounts + row.doneCounts - row.bkCounts }}</span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { getOrderSummaryList, getCurrentShopGroupList } from '@/api/order'

export default {
  name: 'ComplexTable',
  filters: {
    statusFilter(status) {
      const statusMap = {
        'ACTIVE': 'success',
        'EXPIRE': 'info'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      shopGroupList: [],
      total: 0,
      shopList: [],
      shopOptions: [],
      listLoading: false,
      listQuery: {
        businessType: '',
        startTime: '',
        endTime: ''
      },
      options: [{
        value: '',
        label: ''
      }],
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
    this.listQuery.businessType = this.options[0].label
    this.getCurrentShopGroupList()
  },
  methods: {
    getCurrentShopGroupList() {
      this.listLoading = true
      getCurrentShopGroupList(this.listQuery).then(response => {
        this.shopGroupList = response.data
        this.options = []
        this.shopGroupList.forEach((value, index) => {
          const option = {}
          option.value = value.groupName
          option.label = value.businessType
          this.options.push(option)
        })
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    getList() {
      this.listLoading = true
      this.listQuery.startTime = this.timeRange[0]
      this.listQuery.endTime = this.timeRange[1]
      return new Promise((resolve, reject) => {
        getOrderSummaryList(this.listQuery).then(response => {
          this.list = response.data
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1)
        }).catch(error => {
          this.listLoading = false
          reject(error)
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  :deep(.el-input.is-disabled) .el-input__inner {
      color: #000000 !important;
  }
  :deep(.el-dialog__wrapper) {
    top:-100px !important;
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
