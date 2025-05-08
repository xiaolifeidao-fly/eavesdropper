<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="用户" style="width: 200px;" class="filter-item" @keyup.enter.native="getList" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="showCreateUser">
        新建用户
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
      <el-table-column label="ID" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="密码" width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.originPassword }}</span>
        </template>
      </el-table-column>
      <el-table-column label="密钥" width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.secretKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="租户信息" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tenantStr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.roleStr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改租户" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="showUpdateUserTenant(row)">
            修改租户
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="修改角色" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="showUpdateUserRole(row)">
            修改角色
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="修改备注" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="showModifyRemark(row)">
            修改备注
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="余额" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.balanceAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.accountStatus | accountStatusFilter">
            {{ row.accountStatus }}
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
            <el-button slot="reference" :disabled="row.accountStatus==='冻结'" size="mini" type="danger">
              冻结
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="充值" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="clickRecharge(row)">
            充值
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="账户明细" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="accountDetail(row)">
            明细
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="添加用户" :visible.sync="createUserDialogFormVisible">
      <el-form ref="userDataForm" :rules="rules" :model="user" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="user.password" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userRoleDialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createUser()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改租户" :visible.sync="userTanentDialogFormVisible">
      <el-form ref="userTenantDataForm" :rules="rules" :model="userTenant" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名">
          <el-input v-model="userTenant.username" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入用户名" :disabled="true" />
        </el-form-item>
        <el-form-item label="租户">
          <el-select v-model="userTenant.tenantIds" multiple placeholder="请选择租户">
            <el-option
              v-for="item in tenantOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userTanentDialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateUserTenant()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改角色" :visible.sync="userRoleDialogFormVisible">
      <el-form ref="userRoleDataForm" :rules="rules" :model="user" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名">
          <el-input v-model="userRole.username" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入用户名" :disabled="true" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userRole.roleIds" multiple placeholder="请选择角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userRoleDialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateUserRole()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改备注" :visible.sync="modifyRemarkDialogFormVisible">
      <el-form ref="modifyRemarkDataForm" :rules="rules" :model="user" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名">
          <el-input v-model="user.username" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入用户名" :disabled="true" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="user.remark" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="modifyRemarkDialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="modifyRemark()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="充值" :visible.sync="rechargeDialogFormVisible">
      <el-form ref="rechargeDataForm" :rules="accountRules" :model="rechargeObj" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户">
          <el-input v-model="rechargeObj.username" :autosize="{ minRows: 2, maxRows: 4}" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="rechargeObj.amount" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入金额(元)" />
        </el-form-item>
        <el-form-item label="赠送">
          <el-slider
            v-model="rechargeObj.givenScale"
            max="20"
            show-input
          />
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
import { getUserList, getRoleList, getTenantList, saveUserTenant, saveUserRole, createUser, modifyRemark } from '@/api/user'
import { blockAccount, recharge } from '@/api/account'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  filters: {
    accountStatusFilter(status) {
      const statusMap = {
        '正常': 'success',
        '冻结': 'danger',
        '失效': 'info',
        '未知异常': 'info'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      roleList: [],
      roleOptions: [],
      tenantList: [],
      tenantOptions: [],
      rolesSelectValue: [],
      tenantsSelectValue: [],
      userTanentDialogFormVisible: false,
      userRoleDialogFormVisible: false,
      rechargeDialogFormVisible: false,
      modifyRemarkDialogFormVisible: false,
      total: 0,
      listLoading: true,
      listQuery: {
        username: '',
        page: 1,
        limit: 50,
        sort: '+id'
      },
      roleListQuery: {
        roleName: '',
        page: 1,
        limit: 100,
        sort: '+id'
      },
      tenantListQuery: {
        tenantName: '',
        page: 1,
        limit: 100,
        sort: '+id'
      },
      createUserDialogFormVisible: false,
      user: {
        id: undefined,
        username: '',
        password: '',
        accountId: '',
        remark: '',
        status: 'ACTIVE'
      },
      rechargeObj: {
        username: '',
        amount: undefined,
        givenScale: 0
      },
      userRole: {
        userId: undefined,
        username: '',
        roleIds: []
      },
      userTenant: {
        userId: undefined,
        username: '',
        tenantIds: []
      },
      rules: {
        username: [{ required: true, message: '用户名不能为空', trigger: 'change' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'change' }],
        tenant: [{ required: true, message: '租户不能为空', trigger: 'change' }],
        userRoleValue: [{ required: true, message: '角色不能为空', trigger: 'change' }],
        remark: [{ required: true, message: '备注不能为空', trigger: 'change' }]
      },
      accountRules: {
        amount: [{ required: true, message: '金额不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.getRoleList()
    this.getTenantList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getUserList(this.listQuery).then(response => {
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
        this.list = response.data.items
        this.total = response.data.total
        this.list.forEach((value, index) => {
          var roleStr = ''
          var tenantStr = ''
          value.roleModelList.forEach((value, index) => {
            roleStr = roleStr + value.name + ','
          })
          value.tenantModelList.forEach((value, index) => {
            tenantStr = tenantStr + value.name + ','
          })
          Object.assign(value, { roleStr: roleStr.substr(0, roleStr.length - 1) })
          Object.assign(value, { tenantStr: tenantStr.substr(0, tenantStr.length - 1) })
          Object.assign(value, { freezeVisible: false })
        })
      })
    },
    closeFreezePop(index) {
      this.$set(this.list, index, Object.assign(this.list[index], { freezeVisible: false }))
    },
    freeze(row, index) {
      // this.temp = Object.assign({}, row) // copy obj
      // this.temp.status = '冻结中'
      // this.list.splice(index, 1, this.temp)
      blockAccount(row.accountId).then(response => {
        this.getList()
        this.$notify({
          title: '操作成功',
          message: '该账户已成功冻结',
          type: 'success',
          duration: 2000
        })
        this.$set(this.list, index, Object.assign(this.list[index], { freezeVisible: false }))
      })
    },
    clickRecharge(row) {
      this.rechargeObj = Object.assign({}, row) // copy obj
      this.rechargeDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['rechargeDataForm'].clearValidate()
      })
    },
    updateAccountRecharge() {
      this.$refs['rechargeDataForm'].validate((valid) => {
        if (valid) {
          recharge(this.rechargeObj.accountId, this.rechargeObj).then(response => {
            this.rechargeDialogFormVisible = false
            this.getList()
            this.$notify({
              title: '操作成功',
              message: '该账户已成功充值',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    getRoleList() {
      if (this.roleList.length === 0) {
        getRoleList(this.roleListQuery).then(response => {
          this.roleList = response.data.items
          this.roleList.forEach((value, index) => {
            const option = {}
            option.value = value.id
            option.label = value.name
            this.roleOptions.push(option)
          })
        })
      }
    },
    getTenantList() {
      if (this.tenantList.length === 0) {
        getTenantList(this.tenantListQuery).then(response => {
          this.tenantList = response.data.items
          this.tenantList.forEach((value, index) => {
            const option = {}
            option.value = value.id
            option.label = value.name
            this.tenantOptions.push(option)
          })
        })
      }
    },
    showUpdateUserTenant(row) {
      this.userTenant.userId = row.id
      this.userTenant.username = row.username
      this.userTenant.tenantIds = []
      row.tenantModelList.forEach((value, index) => {
        this.userTenant.tenantIds.push(value.id)
      })
      this.userTanentDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['userTenantDataForm'].clearValidate()
      })
    },
    updateUserTenant() {
      this.$refs['userTenantDataForm'].validate((valid) => {
        if (valid) {
          this.userTanentDialogFormVisible = false
          console.log('当前useriId:' + this.userTenant.userId)
          saveUserTenant(this.userTenant.userId, this.userTenant).then(response => {
            this.getList()
            this.$notify({
              title: '操作成功',
              message: '租户信息修改成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    showUpdateUserRole(row) {
      this.userRole.userId = row.id
      this.userRole.username = row.username
      this.userRole.roleIds = []
      row.roleModelList.forEach((value, index) => {
        this.userRole.roleIds.push(value.id)
      })
      this.userRoleDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['userRoleDataForm'].clearValidate()
      })
    },
    updateUserRole() {
      this.$refs['userRoleDataForm'].validate((valid) => {
        if (valid) {
          this.userRoleDialogFormVisible = false
          console.log('当前useriId:' + this.userRole.userId)
          saveUserRole(this.userRole.userId, this.userRole).then(response => {
            this.getList()
            this.$notify({
              title: '操作成功',
              message: '用户的角色信息修改成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    showModifyRemark(row) {
      this.user.id = row.id
      this.user.username = row.username
      this.modifyRemarkDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['modifyRemarkDataForm'].clearValidate()
      })
    },
    modifyRemark() {
      this.$refs['modifyRemarkDataForm'].validate((valid) => {
        if (valid) {
          this.modifyRemarkDialogFormVisible = false
          modifyRemark(this.user.id, this.user).then(response => {
            this.getList()
            this.$notify({
              title: '操作成功',
              message: '修改用户备注成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    showCreateUser() {
      this.createUserDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['userDataForm'].clearValidate()
      })
    },
    createUser() {
      this.$refs['userDataForm'].validate((valid) => {
        if (valid) {
          this.createUserDialogFormVisible = false
          createUser(this.user).then(response => {
            this.getList()
            this.$notify({
              title: '操作成功',
              message: '添加用户成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    accountDetail(row) {
      this.$router.push({
        path: '/account/accountDetail',
        query: {
          accountId: row.accountId
        }
      })
    }
  }
}
</script>
