<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="商品名称" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="editShop">
        新增人工商品
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="shopManualList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="名称" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="编码" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.typeStr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="积分" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.score }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改" align="center" width="110px" class-name="small-padding fixed-width">
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
              <el-button type="primary" size="mini" @click="deleteShopManual(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="row.status==='冻结中'" size="mini" type="danger">
              删除
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="管理员下架" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.visible2"
            placement="top"
            width="160"
            trigger="click"
          >
            <p>确定下架此商品吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="closePop2($index)">取消</el-button>
              <el-button type="primary" size="mini" @click="expireShopManual(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="row.status==='EXPIRE'" size="mini" type="danger">
              下架
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="管理员上架" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.visible3"
            placement="top"
            width="160"
            trigger="click"
          >
            <p>确定上架此商品吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="closePop3($index)">取消</el-button>
              <el-button type="primary" size="mini" @click="activeShopManual(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="row.status==='ACTIVE'" size="mini" type="success">
              上架
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="shopTitle" :visible.sync="createShopdialogFormVisible">
      <el-form ref="shopDataForm" :rules="rules" :model="shopManual" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="类型">
          <el-select v-model="shopManual.shopTypeModelIds" multiple class="filter-item" placeholder="请选择人工类型">
            <el-option
              v-for="item in shopTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="shopManual.name" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="shopManual.code" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="积分" prop="score">
          <el-input v-model="shopManual.score" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入积分" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createShopdialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createOrUpdateShopManual()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getShopManualList, saveShopManual, getShopList, deleteShopManual, expireShopManual, activeShopManual } from '@/api/shop'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        'ACTIVE': 'success',
        'EXPIRE': 'info'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      shopManualList: [],
      shopTypeList: [],
      shopTypeOptions: [],
      total: 0,
      shopTitle: '添加人工商品',
      listLoading: true,
      listQuery: {
        name: '',
        page: 1,
        limit: 50,
        sort: '+id'
      },
      createShopdialogFormVisible: false,
      createShopTenantdialogFormVisible: false,
      shopManual: {
        id: undefined,
        name: '',
        code: '',
        shopTypeModelIds: [],
        shopTypeModelList: [],
        score: 0
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
        score: [{ required: true, message: '积分不能为空', trigger: 'change' }],
        tenantName: [{ required: true, message: '租户名称不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.getShopTypeList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getShopManualList(this.listQuery).then(response => {
        this.shopManualList = response.data.items
        this.total = response.data.total
        this.shopManualList.forEach((value, index) => {
          Object.assign(value, { deleteVisible: false })
          var typeStr = ''
          var typeIds = []
          value.shopTypeModelList.forEach((value, index) => {
            typeStr = typeStr + value.name + ','
            typeIds.push(value.id)
          })
          Object.assign(value, { typeStr: typeStr.substr(0, typeStr.length - 1) })
          Object.assign(value, { shopTypeModelIds: typeIds })
          Object.assign(value, { visible2: false })
          Object.assign(value, { visible3: false })
        })
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    getShopTypeList() {
      this.shopTypeOptions = []
      getShopList().then(response => {
        this.shopTypeList = response.data.items
        this.shopTypeList.forEach((value, index) => {
          const option = {}
          option.value = value.id
          option.label = value.name
          this.shopTypeOptions.push(option)
        })
      })
      console.log('zzzzzzzzzzzz')
      console.log(this.shopTypeOptions)
    },
    updateShop(row) {
      this.shopTitle = '修改商品'
      this.shopManual.id = row.id
      this.shopManual.name = row.name
      this.shopManual.code = row.code
      this.shopManual.score = row.score
      this.shopManual.shopTypeModelIds = row.shopTypeModelIds
      this.createShopdialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['shopDataForm'].clearValidate()
      })
    },
    editShop() {
      this.shopTitle = '添加人工商品'
      this.createShopdialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['shopDataForm'].clearValidate()
      })
    },
    createOrUpdateShopManual() {
      this.shopManual.shopTypeModelList = []
      this.shopManual.shopTypeModelIds.forEach((value, index) => {
        var typeId = value
        this.shopTypeList.forEach((value, index) => {
          if (value.id === typeId) {
            this.shopManual.shopTypeModelList.push(value)
          }
        })
      })
      this.$refs['shopDataForm'].validate((valid) => {
        if (valid) {
          this.createShopdialogFormVisible = false
          if (this.shopTitle === '修改商品') {
            saveShopManual(this.shopManual).then(response => {
              this.getList()
              this.$notify({
                title: '操作成功',
                message: '修改商品成功',
                type: 'success',
                duration: 2000
              })
            })
          }
          if (this.shopTitle === '添加人工商品') {
            saveShopManual(this.shopManual).then(response => {
              this.getList()
              this.$notify({
                title: '操作成功',
                message: '添加人工商品成功',
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
    },
    deleteShopManual(row, index) {
      deleteShopManual(row).then(response => {
        this.getList()
        this.$notify({
          title: '操作成功',
          message: '删除人工商品成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    expireShopManual(row, index) {
      expireShopManual(row).then(response => {
        this.getList()
        this.$notify({
          title: '操作成功',
          message: '该人工商品成功下架',
          type: 'success',
          duration: 2000
        })
        this.$set(this.list, index, Object.assign(this.list[index], { visible2: false }))
      })
    },
    activeShopManual(row, index) {
      activeShopManual(row).then(response => {
        this.getList()
        this.$notify({
          title: '操作成功',
          message: '该人工商品成功上架',
          type: 'success',
          duration: 2000
        })
        this.$set(this.list, index, Object.assign(this.list[index], { visible3: false }))
      })
    }
  }
}
</script>
