<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.shopId" class="filter-item" placeholder="请选择商品">
        <el-option
          v-for="item in shopOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="clickAddCategory">
        新增类目
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
      <el-table-column label="ID" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品" width="90px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.shopName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类目" width="90px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="人工编码" width="90px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.barryShopCategoryCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下限" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.lowerLimit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上限" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.upperLimit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="密钥" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.secretKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.price }}</span>
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
              <el-button type="primary" size="mini" @click="soldOut(row,$index)">确定</el-button>
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
              <el-button type="primary" size="mini" @click="putaway(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="row.status==='ACTIVE'" size="mini" type="success">
              上架
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="管理员编辑" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="editRowByAdmin(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="false" label="商户编辑" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="editRowByUser(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="类目编辑" :visible.sync="dialogFormVisibleByAdmin">
      <el-form ref="adminDataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="商品">
          <el-input v-model="temp.shopName" :autosize="{ minRows: 2, maxRows: 4}" type="text" :disabled="true" />
        </el-form-item>
        <el-form-item label="人工">
          <el-select v-model="temp.shopManualId" class="filter-item" placeholder="请选择人工">
            <el-option
              v-for="item in shopManualOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类目" prop="name">
          <el-input v-model="temp.name" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入类目名称" />
        </el-form-item>
        <el-form-item label="下限" prop="lowerLimit">
          <el-input v-model="temp.lowerLimit" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入下限值" />
        </el-form-item>
        <el-form-item label="上限" prop="upperLimit">
          <el-input v-model="temp.upperLimit" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入上限值" />
        </el-form-item>
        <el-form-item v-if="false" label="密钥">
          <el-input v-model="temp.secretKey" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入密钥" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="temp.price" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入价格" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleByAdmin = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateDatabyAdmin()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增类目" :visible.sync="dialogFormVisibleByUser">
      <el-form ref="userDataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="商品">
          <el-select v-model="temp.shopId" class="filter-item" placeholder="请选择商品">
            <el-option
              v-for="item in shopOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="人工">
          <el-select v-model="temp.shopManualId" class="filter-item" placeholder="请选择人工">
            <el-option
              v-for="item in shopManualOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类目" prop="name">
          <el-input v-model="temp.name" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入类目名称" />
        </el-form-item>
        <el-form-item label="下限" prop="lowerLimit">
          <el-input v-model="temp.lowerLimit" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入下限值" />
        </el-form-item>
        <el-form-item label="上限" prop="upperLimit">
          <el-input v-model="temp.upperLimit" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入上限值" />
        </el-form-item>
        <el-form-item v-if="false" label="密钥">
          <el-input v-model="temp.secretKey" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入密钥" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="temp.price" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入价格" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleByUser = false">
          取消
        </el-button>
        <el-button type="primary" @click="addCategory()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { activeShopCategoryId, expireShopCategoryId, updateShopCategory, addShopCategory, getShopList, getShopCategoryList, getShopManualList } from '@/api/shop'
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
      list: [],
      total: 0,
      shopList: [],
      shopOptions: [],
      shopManualList: [],
      shopManualOptions: [],
      listLoading: true,
      listQuery: {
        shopId: '',
        page: 1,
        limit: 50,
        sort: '+id'
      },
      dialogFormVisibleByAdmin: false,
      dialogFormVisibleByUser: false,
      temp: {
        id: undefined,
        price: undefined,
        tenantName: '',
        name: '',
        secretKey: '',
        upperLimit: undefined,
        lowerLimit: undefined,
        shopId: undefined,
        shopManualId: undefined,
        barryShopCategoryCode: '',
        shopName: '',
        status: ''
      },
      rules: {
        upperLimit: [{ required: true, message: '上限不能为空', trigger: 'change' }],
        lowerLimit: [{ required: true, message: '下限不能为空', trigger: 'change' }],
        price: [{ required: true, message: '价格不能为空', trigger: 'change' }],
        name: [{ required: true, message: '类目名称不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.getShopList()
    this.getShopManualList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getShopCategoryList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.list.forEach((value, index) => {
          Object.assign(value, { visible2: false })
          Object.assign(value, { visible3: false })
        })
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    getShopList() {
      if (this.shopList.length === 0) {
        getShopList().then(response => {
          this.shopList = response.data.items
          this.shopList.forEach((value, index) => {
            const option = {}
            option.value = value.id
            option.label = value.name
            this.shopOptions.push(option)
          })
        })
      }
    },
    getShopManualList() {
      if (this.shopManualList.length === 0) {
        getShopManualList().then(response => {
          this.shopManualList = response.data.items
          this.shopManualList.forEach((value, index) => {
            const option = {}
            option.value = value.id
            option.label = value.name
            this.shopManualOptions.push(option)
          })
        })
      }
    },
    closePop2(index) {
      this.$set(this.list, index, Object.assign(this.list[index], { visible2: false }))
    },
    closePop3(index) {
      this.$set(this.list, index, Object.assign(this.list[index], { visible3: false }))
    },
    soldOut(row, index) {
      // this.temp = Object.assign({}, row) // copy obj
      // this.temp.status = '下架'
      // this.list.splice(index, 1, this.temp)
      expireShopCategoryId(row.id).then(response => {
        this.getList()
        this.$notify({
          title: '操作成功',
          message: '该商品成功下架',
          type: 'success',
          duration: 2000
        })
        this.$set(this.list, index, Object.assign(this.list[index], { visible2: false }))
      })
    },
    putaway(row, index) {
      activeShopCategoryId(row.id).then(response => {
        this.getList()
        this.$notify({
          title: '操作成功',
          message: '该商品成功上架',
          type: 'success',
          duration: 2000
        })
        this.$set(this.list, index, Object.assign(this.list[index], { visible3: false }))
      })
    },
    editRowByAdmin(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogFormVisibleByAdmin = true
      this.$nextTick(() => {
        this.$refs['adminDataForm'].clearValidate()
      })
    },
    editRowByUser(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogFormVisibleByUser = true
      this.$nextTick(() => {
        this.$refs['userDataForm'].clearValidate()
      })
    },
    updateDatabyAdmin() {
      this.$refs['adminDataForm'].validate((valid) => {
        if (valid) {
          // const index = this.list.findIndex(v => v.id === this.temp.id)
          // this.list.splice(index, 1, this.temp)
          this.shopManualList.forEach((value, index) => {
            if (value.id === this.temp.shopManualId) {
              this.temp.barryShopCategoryCode = value.code
            }
          })
          this.dialogFormVisibleByAdmin = false
          updateShopCategory(this.temp.id, this.temp).then(response => {
            this.getList()
            this.$notify({
              title: '操作成功',
              message: '窗口编辑成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    clickAddCategory() {
      this.dialogFormVisibleByUser = true
      this.$nextTick(() => {
        this.$refs['userDataForm'].clearValidate()
      })
    },
    addCategory() {
      this.$refs['userDataForm'].validate((valid) => {
        if (valid) {
          this.dialogFormVisibleByUser = false
          this.shopManualList.forEach((value, index) => {
            if (value.id === this.temp.shopManualId) {
              this.temp.barryShopCategoryCode = value.code
            }
          })
          addShopCategory(this.temp.shopId, this.temp).then(response => {
            this.getList()
            this.$notify({
              title: '操作成功',
              message: '类目添加成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    }
  }
}
</script>
