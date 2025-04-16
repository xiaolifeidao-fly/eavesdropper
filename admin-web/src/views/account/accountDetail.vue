<template>
  <div class="app-container">
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
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
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
      <el-table-column label="操作人" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operator }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账户余额" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.balanceAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账户流水号" width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.businessId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="链接" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tinyUrl }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updateTimeStr }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { getAccountDetail, getAccountDetailByAccountId } from '@/api/account'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      timeRange: '',
      listLoading: true,
      getDetailByAccountId: false,
      listQuery: {
        accountId: undefined,
        page: 1,
        limit: 10,
        sort: '+id',
        startTime: null,
        endTime: null
      },
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
      }
    }
  },
  watch: {
    '$route': 'getParams'
  },
  created() {
    const self = this
    self.getParams()
  },
  methods: {
    getParams() {
      const accountId = this.$route.query.accountId
      if (accountId == null) {
        console.log('params is null')
        this.getDetailByAccountId = false
      } else {
        console.log('params is not null')
        this.getDetailByAccountId = true
        this.listQuery.accountId = accountId
      }
      this.getList()
    },
    getList() {
      this.listLoading = true
      this.listQuery.startTime = this.timeRange[0]
      this.listQuery.endTime = this.timeRange[1]
      if (this.getDetailByAccountId) {
        console.log('params is not null 开始请求')
        getAccountDetailByAccountId(this.listQuery.accountId, this.listQuery).then(response => {
          this.list = response.data.items
          this.total = response.data.total
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1)
        })
      } else {
        console.log('params is null 开始请求')
        getAccountDetail(this.listQuery).then(response => {
          this.list = response.data.items
          this.total = response.data.total
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1)
        })
      }
    }
  }
}
</script>
