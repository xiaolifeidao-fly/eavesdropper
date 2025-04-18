<template>
  <div class="app-container">
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
            <el-form-item style="width: 30%;" label="渠道">
              <el-select v-model="listQuery.channel" placeholder="请选择">
                <el-option
                  v-for="item in channelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item style="width: 50%;" label="">
              <el-button width="150px" icon="el-icon-search" :loading="listLoading" type="primary" @click="getWithdrawSummary()">查询</el-button>
            </el-form-item>
            <el-form-item style="width: 50%;" label="">
              <el-button width="150px" icon="el-icon-download" :loading="exportLoading" type="primary" @click="exportWithdrawSummary()">汇总导出结算中数据</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </el-card>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="withdrawSummaryList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="日期" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.date }}</span>
        </template>
      </el-table-column>
      <el-table-column label="渠道" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.channel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核中的条数" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.approvingNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核中的积分" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.approvingPoints }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结算中的条数" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.accountingNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结算中的积分" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.accountingPoints }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核销完成条数" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.finishNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核销完成积分" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.finishPoints }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核销失败条数" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.errorNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核销失败积分" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.errorPoints }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结算" align="center" width="100px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.accountVisible"
            placement="top"
            width="160"
            trigger="click"
          >
            <p>确定开始结算该渠道所有提现吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="closeDeletePop($index)">取消</el-button>
              <el-button type="primary" size="mini" @click="accountWithdraw(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="row.approvingNum == 0" :loading="row.accountLoading" size="mini" type="primary">
              结算
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="导出" align="center" width="100px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.exportVisible"
            placement="top"
            width="160"
            trigger="click"
          >
            <p>确定开始导出当前行汇总数据吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="closeDeletePop($index)">取消</el-button>
              <el-button type="primary" size="mini" @click="exportSingleLineWithdrawSummary(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" size="mini" type="primary" :loading="row.exportLoading">
              导出
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="核销" align="center" width="100px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.finishVisible"
            placement="top"
            width="160"
            trigger="click"
          >
            <p>确定核销该渠道所有提现吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="closeDeletePop($index)">取消</el-button>
              <el-button type="primary" size="mini" @click="finishWithdraw(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="row.accountingNum == 0" :loading="row.finishLoading" size="mini" type="primary">
              核销
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { getChannelList, getWithdrawSummary, accountWithdraw, finishWithdraw } from '@/api/withdraw'
import { parseTime } from '@/utils'

export default {
  name: 'ComplexTable',
  data() {
    return {
      tableKey: 0,
      withdrawSummaryList: [],
      total: 0,
      timeRange: '',
      listLoading: false,
      exportLoading: false,
      downloadLoading: false,
      getDetailByAccountId: false,
      filename: '充值明细',
      autoWidth: true,
      bookType: 'xlsx',
      listQuery: {
        channel: '',
        startTime: null,
        endTime: null
      },
      accountAndFinishRequest: {
        channel: '',
        startTime: '',
        endTime: ''
      },
      channelList: [],
      channelOptions: [],
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            const end = new Date(new Date().toLocaleDateString())
            const start = new Date(new Date().toLocaleDateString())
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const end = new Date(new Date().toLocaleDateString())
            const start = new Date(new Date().toLocaleDateString())
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '前天',
          onClick(picker) {
            const end = new Date(new Date().toLocaleDateString())
            const start = new Date(new Date().toLocaleDateString())
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 2)
            end.setTime(end.getTime() - 3600 * 1000 * 24 * 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一周',
          onClick(picker) {
            const end = new Date(new Date().toLocaleDateString())
            const start = new Date(new Date().toLocaleDateString())
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date(new Date().toLocaleDateString())
            const start = new Date(new Date().toLocaleDateString())
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date(new Date().toLocaleDateString())
            const start = new Date(new Date().toLocaleDateString())
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  created() {
    this.getChannelList()
  },
  methods: {
    getWithdrawSummary() {
      this.listLoading = true
      this.listQuery.startTime = this.timeRange[0]
      this.listQuery.endTime = this.timeRange[1]
      getWithdrawSummary(this.listQuery).then(response => {
        this.withdrawSummaryList = response.data
        this.withdrawSummaryList.forEach((value, index) => {
          Object.assign(value, { accountLoading: false })
          Object.assign(value, { exportLoading: false })
          Object.assign(value, { finishLoading: false })
          Object.assign(value, { accountVisible: false })
          Object.assign(value, { exportVisible: false })
          Object.assign(value, { finishVisible: false })
        })
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    exportWithdrawSummary() {
      this.exportLoading = true
      var exportUrl = process.env.VUE_APP_API + '/point/withdrawSummary/export' +
        '?channel=' + this.listQuery.channel + '&startTime=' + this.timeRange[0] + '&endTime=' + this.timeRange[1]
      window.open(exportUrl)
      setTimeout(() => {
        this.exportLoading = false
      }, 1000 * 5)
    },
    exportSingleLineWithdrawSummary(row, index) {
      this.closeDeletePop(index)
      row.exportLoading = true
      var exportDate = row.date + ' 00:00:00'
      var exportUrl = process.env.VUE_APP_API + '/point/withdrawSummary/export' +
        '?channel=' + this.listQuery.channel + '&startTime=' + exportDate + '&endTime=' + exportDate
      window.open(exportUrl)
      setTimeout(() => {
        this.$set(this.withdrawSummaryList, index, Object.assign(this.withdrawSummaryList[index], { exportLoading: false }))
      }, 1000 * 5)
    },
    accountWithdraw(row, index) {
      this.closeDeletePop(index)
      row.accountLoading = true
      this.accountAndFinishRequest.channel = row.channel
      this.accountAndFinishRequest.startTime = row.date + ' 00:00:00'
      this.accountAndFinishRequest.endTime = row.date + ' 00:00:00'
      accountWithdraw(this.accountAndFinishRequest).then(response => {
        this.$notify({
          title: '操作成功',
          message: '积分开始结算',
          type: 'success',
          duration: 2000
        })
        setTimeout(() => {
          this.$set(this.withdrawSummaryList, index, Object.assign(this.withdrawSummaryList[index], { accountLoading: false }))
        }, 1000 * 5)
      })
    },
    finishWithdraw(row, index) {
      this.closeDeletePop(index)
      row.finishLoading = true
      this.accountAndFinishRequest.channel = row.channel
      this.accountAndFinishRequest.startTime = row.date + ' 00:00:00'
      this.accountAndFinishRequest.endTime = row.date + ' 00:00:00'
      finishWithdraw(this.accountAndFinishRequest).then(response => {
        this.$notify({
          title: '操作成功',
          message: '积分开始核销',
          type: 'success',
          duration: 2000
        })
        setTimeout(() => {
          this.$set(this.withdrawSummaryList, index, Object.assign(this.withdrawSummaryList[index], { finishLoading: false }))
        }, 1000 * 5)
      })
    },
    getChannelList() {
      this.channelList = []
      this.channelOptions = []
      getChannelList().then(response => {
        this.channelList = response.data
        this.channelList.forEach((value, index) => {
          const option = {}
          option.value = value.code
          option.label = value.name
          this.channelOptions.push(option)
        })
      })
    },
    closeDeletePop(index) {
      this.$set(this.withdrawSummaryList, index, Object.assign(this.withdrawSummaryList[index], { accountVisible: false }))
      this.$set(this.withdrawSummaryList, index, Object.assign(this.withdrawSummaryList[index], { exportVisible: false }))
      this.$set(this.withdrawSummaryList, index, Object.assign(this.withdrawSummaryList[index], { finishVisible: false }))
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
<style lang="scss" scoped>
  :deep(.el-input.is-disabled) .el-input__inner {
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
