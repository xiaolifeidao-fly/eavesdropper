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
      <el-button v-waves style="margin:0 0 20px 20px;" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button :loading="downloadLoading" style="margin:0 0 20px 20px;" type="primary" icon="el-icon-document" @click="handleDownload">
        导出
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
      <el-table-column label="流水号" width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.businessId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充值金额" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operator }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operatorTime }}</span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { getRechargeList } from '@/api/recharge'
import { parseTime } from '@/utils'

export default {
  name: 'ComplexTable',
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      timeRange: '',
      listLoading: false,
      downloadLoading: false,
      getDetailByAccountId: false,
      filename: '充值明细',
      autoWidth: true,
      bookType: 'xlsx',
      listQuery: {
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
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.startTime = this.timeRange[0]
      this.listQuery.endTime = this.timeRange[1]
      getRechargeList(this.listQuery).then(response => {
        this.list = response.data
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['流水号', '用户名', '备注', '充值金额', '描述', '操作人', '操作时间']
        const filterVal = ['businessId', 'username', 'remark', 'amount', 'description', 'operator', 'operatorTime']
        const list = this.list
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.filename,
          autoWidth: this.autoWidth,
          bookType: this.bookType
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
