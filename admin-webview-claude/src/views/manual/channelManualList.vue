<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getChannelDetailList">
        查询
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="editChannelDetail">
        新增渠道
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="channelDetailList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="编码" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.typeDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="徒弟积分比例" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.retailerCommissionScale }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作室积分比例(>=0)" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.merchantCommissionScale }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否允许获取任务" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.allowAssign | allowAssignFilter">
            {{ row.allowAssignStr }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="获取任务上限" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.assignLimit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="updateShop(row)">
            修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getChannelDetailList" />

    <el-dialog :title="channelDetailTitle" :visible.sync="createChannelDetaildialogFormVisible">
      <el-form ref="channelDetailDataForm" :model="channelDetail" label-position="left" label-width="150px" style="width: 400px; margin-left:50px;">
        <el-form-item label="编码">
          <el-input v-model="channelDetail.code" :disabled="codeDisabled" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="channelDetail.name" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="channelDetail.type" class="filter-item" placeholder="请选择类型" @change="typeChange">
            <el-option
              v-for="item in typeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="徒弟积分比例">
          <el-input v-model="channelDetail.retailerCommissionScale" :disabled="retailerDisabled" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入徒弟积分比例" />
        </el-form-item>
        <el-form-item label="工作室积分比例(>=0)">
          <el-input v-model="channelDetail.merchantCommissionScale" :disabled="merchantDisabled" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入工作室积分比例" />
        </el-form-item>
        <el-form-item label="是否允许获取任务">
          <el-select v-model="channelDetail.allowAssign" class="filter-item" placeholder="请选择类型">
            <el-option
              v-for="item in assignOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="获取任务上限">
          <el-input v-model="channelDetail.assignLimit" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入任务上限" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="channelDetail.remark" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入备注" />
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
import { getChannelDetailList, updateChannelDetail, saveChannelDetail } from '@/api/channel'
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
      channelDetailList: [],
      typeOption: [{ label: '散户', value: 'RETAILER' }, { label: '工作室', value: 'MERCHANT' }],
      assignOption: [{ label: '允许获取', value: true }, { label: '禁止获取', value: false }],
      total: 0,
      retailerDisabled: false,
      merchantDisabled: false,
      codeDisabled: false,
      channelDetailTitle: '添加渠道',
      listLoading: true,
      listQuery: {
        name: '',
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
    this.getChannelDetailList()
  },
  methods: {
    getChannelDetailList() {
      this.listLoading = true
      getChannelDetailList(this.listQuery).then(response => {
        this.channelDetailList = response.data
        this.total = this.channelDetailList.length
        this.channelDetailList.forEach((value, index) => {
          if (value.allowAssign === true) {
            Object.assign(value, { allowAssignStr: '允许获取' })
          } else {
            Object.assign(value, { allowAssignStr: '禁止获取' })
          }
        })
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
      this.channelDetailTitle = '修改渠道'
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
      this.channelDetail = {}
      this.channelDetailTitle = '添加渠道'
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
          if (this.channelDetailTitle === '修改渠道') {
            updateChannelDetail(this.channelDetail).then(response => {
              this.getChannelDetailList()
              this.$notify({
                title: '操作成功',
                message: '修改渠道成功',
                type: 'success',
                duration: 2000
              })
            })
          }
          if (this.channelDetailTitle === '添加渠道') {
            saveChannelDetail(this.channelDetail).then(response => {
              this.getChannelDetailList()
              this.$notify({
                title: '操作成功',
                message: '添加渠道成功',
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
