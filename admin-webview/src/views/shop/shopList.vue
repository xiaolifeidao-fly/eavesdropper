<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="商品名称" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button v-if="false" v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="editShop">
        新增商品
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
      <el-table-column label="名称" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="编码" width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" label="修改" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="updateShop(row)">
            修改
          </el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="false" label="删除" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.deleteVisible"
            placement="top"
            width="160"
            trigger="click"
          >
            <p>确定删除该商品吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="closeDeletePop($index)">取消</el-button>
              <el-button type="primary" size="mini" @click="deleteShop(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="row.status==='冻结中'" size="mini" type="danger">
              删除
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="shopTitle" :visible.sync="createShopdialogFormVisible">
      <el-form ref="shopDataForm" :rules="rules" :model="shop" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="shop.name" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="shop.code" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入商品编码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createShopdialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createOrUpdateShop()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="分配给租户" :visible.sync="createShopTenantdialogFormVisible">
      <el-form ref="shopTenantDataForm" :rules="rules" :model="shopTenant" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="shopTenant.name" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="shopTenant.code" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入商品编码" />
        </el-form-item>
        <el-form-item label="租户" prop="tenantName">
          <el-input v-model="shopTenant.tenantName" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入租户名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createShopTenantdialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createShopTenant()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getShopList, updateShop, saveShop, deleteShop } from '@/api/shop'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      list: [],
      shopList: [],
      total: 0,
      shopTitle: '添加商品',
      listLoading: true,
      listQuery: {
        name: '',
        page: 1,
        limit: 50,
        sort: '+id'
      },
      createShopdialogFormVisible: false,
      createShopTenantdialogFormVisible: false,
      shop: {
        id: undefined,
        name: '',
        code: ''
      },
      shopTenant: {
        id: undefined,
        name: '',
        code: '',
        tenantName: ''
      },
      rules: {
        name: [{ required: true, message: '商品名称不能为空', trigger: 'change' }],
        code: [{ required: true, message: '商品编码不能为空', trigger: 'change' }],
        tenantName: [{ required: true, message: '租户名称不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getShopList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.list.forEach((value, index) => {
          Object.assign(value, { deleteVisible: false })
        })
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    updateShop(row) {
      this.shopTitle = '修改商品'
      this.shop.id = row.id
      this.shop.name = row.name
      this.shop.code = row.code
      this.createShopdialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['shopDataForm'].clearValidate()
      })
    },
    editShop() {
      this.shopTitle = '添加商品'
      this.createShopdialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['shopDataForm'].clearValidate()
      })
    },
    createOrUpdateShop() {
      this.$refs['shopDataForm'].validate((valid) => {
        if (valid) {
          this.createShopdialogFormVisible = false
          if (this.shopTitle === '修改商品') {
            updateShop(this.shop.id, this.shop).then(response => {
              this.getList()
              this.$notify({
                title: '操作成功',
                message: '修改商品成功',
                type: 'success',
                duration: 2000
              })
            })
          }
          if (this.shopTitle === '添加商品') {
            saveShop(this.shop).then(response => {
              this.getList()
              this.$notify({
                title: '操作成功',
                message: '添加商品成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        }
      })
    },
    updateShopTenant(row) {
      this.shopTenant.id = row.id
      this.shopTenant.name = row.name
      this.shopTenant.code = row.code
      this.createShopTenantdialogFormVisible = true
    },
    createShopTenant() {
      this.$refs['shopTenantDataForm'].validate((valid) => {
        if (valid) {
          this.createShopTenantdialogFormVisible = false
          this.$notify({
            title: '操作成功',
            message: '为租户分配商品成功',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    closeDeletePop(index) {
      this.$set(this.list, index, Object.assign(this.list[index], { deleteVisible: false }))
    },
    deleteShop(row, index) {
      deleteShop(row.id, row).then(response => {
        this.getList()
        this.$notify({
          title: '操作成功',
          message: '删除商品成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>
