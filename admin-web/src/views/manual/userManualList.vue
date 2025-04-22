<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="请输入用户名" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getUserDetail">
        查询
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="editChannelDetail">
        新建用户
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="userDetailList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="用户名" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="密码" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.originalPassword }}</span>
        </template>
      </el-table-column>
      <el-table-column label="渠道" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.channel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邀请码" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.inventCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="致富宝姓名" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.alipayName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="致富宝账号" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.alipayAccount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改" align="center" width="150px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="updateShop(row)">
            修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getUserDetail" />

    <el-dialog :title="channelDetailTitle" :visible.sync="createChannelDetaildialogFormVisible">
      <el-form ref="channelDetailDataForm" :model="channelDetail" label-position="left" label-width="150px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名">
          <el-input v-model="userDetail.username" :disabled="codeDisabled" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="userDetail.password" :disabled="codeDisabled" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="渠道">
          <el-select v-model="userDetail.channel" class="filter-item" placeholder="请选择渠道" @change="typeChange">
            <el-option
              v-for="item in channelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="致富宝姓名">
          <el-input v-model="userDetail.alipayName" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入致富宝姓名" />
        </el-form-item>
        <el-form-item label="致富宝账号">
          <el-input v-model="userDetail.alipayAccount" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入致富宝账号" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createChannelDetaildialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createOrUpdateChannelDetail()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserDetail, updateUserDetail, saveUserDetail } from '@/api/userDetail'
import { getChannelList } from '@/api/withdraw'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  filters: {
    allowAssignFilter(allowAssign) {
      const statusMap = {
        true: 'success',
        false: 'info'
      }
      return statusMap[allowAssign]
    }
  },
  data() {
    return {
      tableKey: 0,
      channelList: [],
      channelOptions: [],
      userDetail: {
        id: undefined,
        username: '',
        password: '',
        channel: '',
        inventCode: '',
        alipayName: '',
        alipayAccount: ''
      },
      userDetailList: [],
      typeOption: [{ label: '散户', value: 'RETAILER' }, { label: '工作室', value: 'MERCHANT' }],
      assignOption: [{ label: '允许获取', value: true }, { label: '禁止获取', value: false }],
      total: 0,
      retailerDisabled: false,
      merchantDisabled: false,
      codeDisabled: false,
      channelDetailTitle: '添加用户',
      listLoading: false,
      listQuery: {
        username: '',
        page: 1,
        limit: 50,
        sort: '+id'
      },
      createChannelDetaildialogFormVisible: false,
      createShopTenantdialogFormVisible: false,
      channelDetail: {
        id: undefined,
        code: '',
        name: '',
        type: '',
        retailerCommissionScale: '',
        merchantCommissionScale: '',
        allowAssign: true,
        assignLimit: undefined,
        remark: ''
      },
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
        code: [{ required: true, message: '编码不能为空', trigger: 'change' }],
        type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
        assignLimit: [{ required: true, message: '上限不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getChannelList()
  },
  methods: {
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
    getUserDetail() {
      this.listLoading = true
      this.userDetail = {}
      this.userDetailList = []
      getUserDetail(this.listQuery).then(response => {
        var userData = response.data
        if (userData != null) {
          this.userDetail = response.data
          this.userDetailList.push(this.userDetail)
        }
        setTimeout(() => {
          this.listLoading = false
        }, 500 * 1)
      })
    },
    typeChange() {
      if (this.channelDetail.type === 'RETAILER') {
        this.merchantDisabled = true
        this.channelDetail.merchantCommissionScale = ''
        this.retailerDisabled = false
      }
      if (this.channelDetail.type === 'MERCHANT') {
        this.retailerDisabled = true
        this.channelDetail.retailerCommissionScale = ''
        this.merchantDisabled = false
      }
    },
    updateShop(row) {
      this.channelDetailTitle = '修改用户信息'
      this.codeDisabled = true
      this.channelDetail.id = row.id
      this.channelDetail.code = row.code
      this.channelDetail.name = row.name
      this.channelDetail.type = row.type
      this.channelDetail.retailerCommissionScale = row.retailerCommissionScale
      this.channelDetail.merchantCommissionScale = row.merchantCommissionScale
      this.channelDetail.allowAssign = row.allowAssign
      this.channelDetail.assignLimit = row.assignLimit
      this.channelDetail.remark = row.remark
      this.createChannelDetaildialogFormVisible = true
      this.typeChange()
      this.$nextTick(() => {
        this.$refs['channelDetailDataForm'].clearValidate()
      })
    },
    editChannelDetail() {
      this.userDetail = {}
      this.channelDetailTitle = '添加用户'
      this.codeDisabled = false
      this.createChannelDetaildialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['channelDetailDataForm'].clearValidate()
      })
    },
    createOrUpdateChannelDetail() {
      this.$refs['channelDetailDataForm'].validate((valid) => {
        if (valid) {
          this.createChannelDetaildialogFormVisible = false
          if (this.channelDetailTitle === '修改用户信息') {
            updateUserDetail(this.userDetail).then(response => {
              this.getUserDetail()
              this.$notify({
                title: '操作成功',
                message: '修改用户信息成功',
                type: 'success',
                duration: 2000
              })
            })
          }
          if (this.channelDetailTitle === '添加用户') {
            saveUserDetail(this.userDetail).then(response => {
              this.listQuery.username = this.userDetail.username
              this.getUserDetail()
              this.$notify({
                title: '操作成功',
                message: '添加用户成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        }
      })
    },
    closeDeletePop(index) {
      this.$set(this.list, index, Object.assign(this.list[index], { deleteVisible: false }))
    },
    closePop2(index) {
      this.$set(this.list, index, Object.assign(this.list[index], { visible2: false }))
    },
    closePop3(index) {
      this.$set(this.list, index, Object.assign(this.list[index], { visible3: false }))
    }
  }
}
</script>
