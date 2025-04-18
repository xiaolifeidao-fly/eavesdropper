<template>
  <div class="app-container">
    <el-card class="box-card">
      <section class="card-content caling-info">
        <div class="base-info">
          <el-form class="el-form-query" label-width="80px">
            <el-form-item label="用户名">
              <el-input v-model="listQuery.username" placeholder="请输入用户名" style="width: 200px;" class="filter-item" />
            </el-form-item>
            <el-form-item style="width: 50%;" label="">
              <el-button width="150px" icon="el-icon-search" :loading="listLoading" type="primary" @click="getUserWithdrawRecord()">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </el-card>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="withdrawRecordList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="渠道" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.channel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="积分" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.points }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.statusStr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请提现时间" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.applyTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批时间" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.approveTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.description }}</span>
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
            <p>确定结算该用户提现吗？</p>
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
      <el-table-column label="核销" align="center" width="100px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.finishVisible"
            placement="top"
            width="160"
            trigger="click"
          >
            <p>确定核销该用户提现吗？</p>
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
      <el-table-column label="撤回" align="center" width="100px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.finishVisible"
            placement="top"
            width="260"
            trigger="click"
          >
            <p>确定撤回该用户提现吗？</p>
            <el-input v-model="row.desc" placeholder="请输入撤回原因" style="width: 200px;" class="filter-item" />
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="closeDeletePop($index)">取消</el-button>
              <el-button type="primary" size="mini" @click="cancelWithdraw(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="row.accountingNum == 0" :loading="row.finishLoading" size="mini" type="primary">
              撤回
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { getUserWithdrawRecord, accountUserWithdraw, finishUserWithdraw, cancelUserWithdraw } from '@/api/userWithdraw'
import { parseTime } from '@/utils'

export default {
  name: 'ComplexTable',
  data() {
    return {
      tableKey: 0,
      withdrawRecordList: [],
      withdrawStatus: [{ label: '待审核', value: 'UN_APPROVE' }, { label: '审核中', value: 'APPROVING' },
        { label: '提现失败', value: 'ERROR' }, { label: '取消成功', value: 'CANCEL' },
        { label: '取消中', value: 'CANCELING' }, { label: '结算中', value: 'ACCOUNTING' },
        { label: '待完成', value: 'UN_FINISH' }, { label: '提现成功', value: 'FINISH' }],
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
        username: ''
      },
      userWithdrawRequest: {
        username: '',
        userPointWithdrawRecordId: undefined,
        description: ''
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
  methods: {
    getUserWithdrawRecord() {
      this.listLoading = true
      getUserWithdrawRecord(this.listQuery).then(response => {
        this.withdrawRecordList = response.data
        this.withdrawRecordList.forEach((value, index) => {
          this.withdrawStatus.forEach((statusValue, statusIndex) => {
            if (value.status === statusValue.value) {
              Object.assign(value, { statusStr: statusValue.label })
            }
          })
          Object.assign(value, { accountLoading: false })
          Object.assign(value, { finishLoading: false })
          Object.assign(value, { cancelLoading: false })
          Object.assign(value, { accountVisible: false })
          Object.assign(value, { finishVisible: false })
          Object.assign(value, { cancelVisible: false })
        })
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    accountWithdraw(row, index) {
      this.closeDeletePop(index)
      row.accountLoading = true
      this.userWithdrawRequest.username = this.listQuery.username
      this.userWithdrawRequest.userPointWithdrawRecordId = row.id
      accountUserWithdraw(this.userWithdrawRequest).then(response => {
        this.$notify({
          title: '操作成功',
          message: '用户积分开始结算',
          type: 'success',
          duration: 2000
        })
        setTimeout(() => {
          this.$set(this.withdrawRecordList, index, Object.assign(this.withdrawRecordList[index], { accountLoading: false }))
        }, 1000 * 5)
      })
    },
    finishWithdraw(row, index) {
      this.closeDeletePop(index)
      row.finishLoading = true
      this.userWithdrawRequest.username = this.listQuery.username
      this.userWithdrawRequest.userPointWithdrawRecordId = row.id
      finishUserWithdraw(this.userWithdrawRequest).then(response => {
        this.$notify({
          title: '操作成功',
          message: '用户积分开始核销',
          type: 'success',
          duration: 2000
        })
        setTimeout(() => {
          this.$set(this.withdrawRecordList, index, Object.assign(this.withdrawRecordList[index], { finishLoading: false }))
        }, 1000 * 5)
      })
    },
    cancelWithdraw(row, index) {
      this.closeDeletePop(index)
      row.cancelLoading = true
      console.log(row.desc)
      if (row.desc === '' || row.desc === undefined) {
        this.$notify({
          title: '操作失败',
          message: '撤回原因不能为空',
          type: 'error',
          duration: 2000
        })
        return
      }
      this.userWithdrawRequest.description = row.desc
      this.userWithdrawRequest.username = this.listQuery.username
      this.userWithdrawRequest.userPointWithdrawRecordId = row.id
      cancelUserWithdraw(this.userWithdrawRequest).then(response => {
        this.$notify({
          title: '操作成功',
          message: '用户积分取消提现',
          type: 'success',
          duration: 2000
        })
        setTimeout(() => {
          this.$set(this.withdrawRecordList, index, Object.assign(this.withdrawRecordList[index], { finishLoading: false }))
        }, 1000 * 5)
      })
    },
    closeDeletePop(index) {
      this.$set(this.withdrawRecordList, index, Object.assign(this.withdrawRecordList[index], { accountVisible: false }))
      this.$set(this.withdrawRecordList, index, Object.assign(this.withdrawRecordList[index], { exportVisible: false }))
      this.$set(this.withdrawRecordList, index, Object.assign(this.withdrawRecordList[index], { finishVisible: false }))
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
