<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="用户" style="width: 200px;" class="filter-item" @keyup.enter.native="getList" />
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
      <el-table-column label="用户" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="冻结" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.freezeVisible"
            placement="top"
            width="160"
            trigger="click"
          >
            <p>确定冻结该账户吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="closeFreezePop($index)">取消</el-button>
              <el-button type="primary" size="mini" @click="freeze(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="row.status==='冻结中'" size="mini" type="danger">
              冻结
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="充值" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="recharge(row)">
            充值
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="充值" :visible.sync="rechargeDialogFormVisible">
      <el-form ref="rechargeDataForm" :rules="accountRules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户">
          <el-input v-model="temp.username" :autosize="{ minRows: 2, maxRows: 4}" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="rechargeAmount" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入金额" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rechargeDialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateAccountRecharge()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getAccountlList } from '@/api/account'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '正常': 'success',
        '冻结中': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      rechargeDialogFormVisible: false,
      listQuery: {
        username: '',
        page: 1,
        limit: 10,
        sort: '+id'
      },
      temp: {
        id: undefined,
        username: '',
        amount: undefined,
        status: ''
      },
      rechargeAmount: '',
      accountRules: {
        amount: [{ required: true, message: '金额不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getAccountlList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.list.forEach((value, index) => {
          Object.assign(value, { freezeVisible: false })
        })
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    closeFreezePop(index) {
      this.$set(this.list, index, Object.assign(this.list[index], { freezeVisible: false }))
    },
    freeze(row, index) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.status = '冻结中'
      this.list.splice(index, 1, this.temp)
      this.$notify({
        title: '操作成功',
        message: '该账户已成功冻结',
        type: 'success',
        duration: 2000
      })
      this.$set(this.list, index, Object.assign(this.list[index], { freezeVisible: false }))
    },
    recharge(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.rechargeDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['rechargeDataForm'].clearValidate()
      })
    },
    updateAccountRecharge() {
      this.$refs['rechargeDataForm'].validate((valid) => {
        if (valid) {
          const index = this.list.findIndex(v => v.id === this.temp.id)
          // TODO request
          this.temp.amount = parseInt(this.temp.amount) + parseInt(this.rechargeAmount)
          this.list.splice(index, 1, this.temp)
          this.rechargeDialogFormVisible = false
          this.$notify({
            title: '操作成功',
            message: '充值完成',
            type: 'success',
            duration: 2000
          })
        }
      })
    }
  }
}
</script>
