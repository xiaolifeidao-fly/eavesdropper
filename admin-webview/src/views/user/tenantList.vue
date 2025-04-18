<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="租户名称" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="editTenant">
        新增租户
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="tenantList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="租户名称" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="租户编码" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前类目" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.shopCategoryStr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类目编辑" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="showUpdateTenantShopCategory(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="修改" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="updateTenant(row)">
            修改
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="删除" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.deleteVisible"
            placement="top"
            width="160"
            trigger="click"
          >
            <p>确定删除该类目吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="closeDeletePop($index)">取消</el-button>
              <el-button type="primary" size="mini" @click="deleteTenant(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="row.status==='冻结中'" size="mini" type="danger">
              删除
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="tenantTitle" :visible.sync="createTenantdialogFormVisible">
      <el-form ref="tenantDataForm" :rules="rules" :model="tenant" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="tenant.name" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="tenant.code" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入租户编码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createTenantdialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createOrUpdateTenant()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="为租户编类目信息" :rules="rules" :visible.sync="tanantShopDialogFormVisible">
      <el-form ref="tenantShopCategoryDataForm" :model="tenantShopCategory" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="租户" prop="tenantName">
          <el-input v-model="tenantShopCategory.tenantName" :autosize="{ minRows: 2, maxRows: 4}" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="类目">
          <el-select v-model="tenantShopCategory.shopCategoryIds" multiple placeholder="请选择类目">
            <el-option
              v-for="item in shopCategoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="tanantShopDialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateTenantShopCategory()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getTenantList, saveTenant, deleteTenant, updateTenant, updateTenantShopCategory } from '@/api/user'
import { getShopCategoryList } from '@/api/shop'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      tenantList: [],
      shopCategoryList: [],
      shopCategoryOptions: [],
      tenantTitle: '',
      total: 0,
      listLoading: true,
      createTenantdialogFormVisible: false,
      tanantShopDialogFormVisible: false,
      listQuery: {
        tenantName: '',
        page: 1,
        limit: 20,
        sort: '+id'
      },
      shopCategoryListQuery: {
        name: '',
        page: 1,
        limit: 100,
        sort: '+id'
      },
      tenant: {
        id: undefined,
        name: '',
        code: ''
      },
      tenantShopCategory: {
        tenantId: undefined,
        tenantName: '',
        shopCategoryIds: []
      },
      rules: {
        name: [{ required: true, message: '类目名称不能为空', trigger: 'change' }],
        code: [{ required: true, message: '类目编码不能为空', trigger: 'change' }],
        tenantName: [{ required: true, message: '租户名称不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.getShopCategoryList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getTenantList(this.listQuery).then(response => {
        this.tenantList = response.data.items
        this.total = response.data.total
        this.tenantList.forEach((value, index) => {
          Object.assign(value, { deleteVisible: false })
          var shopCategoryStr = ''
          value.tenantShopCategoryList.forEach((value, index) => {
            shopCategoryStr = shopCategoryStr + value.name + ','
          })
          Object.assign(value, { shopCategoryStr: shopCategoryStr.substr(0, shopCategoryStr.length - 1) })
        })
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    getShopCategoryList() {
      if (this.shopCategoryList.length === 0) {
        getShopCategoryList(this.shopCategoryListQuery).then(response => {
          this.shopCategoryList = response.data.items
          this.shopCategoryList.forEach((value, index) => {
            const option = {}
            option.value = value.id
            option.label = value.name
            this.shopCategoryOptions.push(option)
          })
        })
      }
    },
    showUpdateTenantShopCategory(row) {
      this.tenantShopCategory.tenantId = row.id
      this.tenantShopCategory.tenantName = row.name
      this.tenantShopCategory.shopCategoryIds = []
      row.tenantShopCategoryList.forEach((value, index) => {
        this.tenantShopCategory.shopCategoryIds.push(value.id)
      })
      this.tanantShopDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['tenantShopCategoryDataForm'].clearValidate()
      })
    },
    updateTenantShopCategory() {
      this.$refs['tenantShopCategoryDataForm'].validate((valid) => {
        if (valid) {
          this.tanantShopDialogFormVisible = false
          updateTenantShopCategory(this.tenantShopCategory.tenantId, this.tenantShopCategory).then(response => {
            this.getList()
            this.$notify({
              title: '操作成功',
              message: '用户的租户信息修改成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    editTenant() {
      this.tenantTitle = '添加租户'
      this.createTenantdialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['tenantDataForm'].clearValidate()
      })
    },
    createOrUpdateTenant() {
      this.$refs['tenantDataForm'].validate((valid) => {
        if (valid) {
          this.createTenantdialogFormVisible = false
          if (this.tenantTitle === '修改租户') {
            updateTenant(this.tenant.id, this.tenant).then(response => {
              this.getList()
              this.$notify({
                title: '操作成功',
                message: '修改租户成功',
                type: 'success',
                duration: 2000
              })
            })
          }
          if (this.tenantTitle === '添加租户') {
            saveTenant(this.tenant).then(response => {
              this.getList()
              this.$notify({
                title: '操作成功',
                message: '添加租户成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        }
      })
    },
    updateTenant(row) {
      this.tenantTitle = '修改租户'
      this.tenant.id = row.id
      this.tenant.name = row.name
      this.tenant.code = row.code
      this.createTenantdialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['tenantDataForm'].clearValidate()
      })
    },
    closeDeletePop(index) {
      this.$set(this.tenantList, index, Object.assign(this.tenantList[index], { deleteVisible: false }))
    },
    deleteTenant(row, index) {
      deleteTenant(row.id, row).then(response => {
        this.getList()
        this.$notify({
          title: '操作成功',
          message: '删除租户成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>
