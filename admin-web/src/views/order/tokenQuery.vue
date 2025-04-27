<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-card class="box-card filter-container">
       <el-form :inline="true" :model="listQuery" class="el-form-query" label-width="80px">
          <el-form-item label="订单号">
            <el-input v-model="listQuery.orderRecordId" placeholder="订单号" clearable />
          </el-form-item>
          <el-form-item label="激活码">
            <el-input v-model="listQuery.token" placeholder="激活码" clearable />
          </el-form-item>
          <el-form-item label="店铺名称">
            <el-input v-model="listQuery.tbShopName" placeholder="店铺名称" clearable />
          </el-form-item>
          <el-form-item label="店铺ID">
            <el-input v-model="listQuery.tbShopId" placeholder="店铺ID" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="listQuery.status" placeholder="状态" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
           <el-form-item label="用户ID">
            <el-input v-model.number="listQuery.userId" type="number" placeholder="用户ID" clearable />
          </el-form-item>
           <el-form-item label="创建时间">
             <el-date-picker
               v-model="createTimeRange"
               type="datetimerange"
               value-format="yyyy-MM-dd HH:mm:ss"
               :picker-options="pickerOptions"
               range-separator="至"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
               align="right"
               @change="handleCreateTimeChange"
             />
           </el-form-item>
          <el-form-item label="绑定时间">
             <el-date-picker
               v-model="bindTimeRange"
               type="datetimerange"
               value-format="yyyy-MM-dd HH:mm:ss"
               :picker-options="pickerOptions"
               range-separator="至"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
               align="right"
               @change="handleBindTimeChange"
             />
           </el-form-item>
           <el-form-item label="过期时间">
             <el-date-picker
               v-model="expireTimeRange"
               type="datetimerange"
               value-format="yyyy-MM-dd HH:mm:ss"
               :picker-options="pickerOptions"
               range-separator="至"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
               align="right"
               @change="handleExpireTimeChange"
             />
           </el-form-item>
          <el-form-item>
            <el-button v-waves :loading="listLoading" type="primary" icon="el-icon-search" @click="handleFilter">
              查询
            </el-button>
          </el-form-item>
       </el-form>
    </el-card>

    <!-- 结果表格 -->
    <token-table
      :token-list="tokenList"
      :list-loading="listLoading"
      :total="total"
      :list-query="listQuery"
      @pagination="fetchData"
    />

  </div>
</template>

<script>
import { queryTokenManagerList } from '@/api/order'
import TokenTable from './components/TokenTable'
// import Pagination from '@/components/Pagination' // Pagination is included in TokenTable
import waves from '@/directive/waves' // waves directive

// Define status options with value (code) and label (Chinese text)
const statusOptions = [
  { value: 'UNBIND', label: '未绑定' },
  { value: 'BINDING', label: '绑定中' },
  { value: 'BOUND', label: '已绑定' },
  { value: 'BIND_FAILED', label: '绑定失败' },
  { value: 'AUTH_EXPIRED', label: '授权过期' },
  { value: 'UNBOUND', label: '已解绑' },
  { value: 'DISABLED', label: '已禁用' }
]

export default {
  name: 'TokenQuery',
  components: { TokenTable }, // Removed Pagination as it's included in TokenTable
  directives: { waves },
  data() {
    return {
      tokenList: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        sort: '+id', // 或者根据后端支持情况调整
        // 查询条件对应 QueryTokenDetailModel
        orderRecordId: undefined,
        token: undefined,
        tbShopName: undefined,
        tbShopId: undefined,
        status: undefined,
        userId: undefined,
        bindTimeStart: undefined,
        bindTimeEnd: undefined,
        createTimeStart: undefined,
        createTimeEnd: undefined,
        expireTimeStart: undefined,
        expireTimeEnd: undefined
      },
      // Use the defined structured options
      statusOptions: statusOptions,
      // 时间范围选择器
      createTimeRange: [],
      bindTimeRange: [],
      expireTimeRange: [],
      pickerOptions: { // 参考 TokenPaneQuery.vue
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      // 清理空的查询参数，避免发送无效的查询条件
      const query = {}
      for (const key in this.listQuery) {
        if (this.listQuery[key] !== undefined && this.listQuery[key] !== null && this.listQuery[key] !== '') {
          query[key] = this.listQuery[key]
        }
      }

      queryTokenManagerList(query).then(response => {
        this.tokenList = response.data.items || []
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    // 时间范围变化时更新 listQuery
    handleCreateTimeChange(val) {
      this.listQuery.createTimeStart = val ? val[0] : undefined
      this.listQuery.createTimeEnd = val ? val[1] : undefined
    },
    handleBindTimeChange(val) {
      this.listQuery.bindTimeStart = val ? val[0] : undefined
      this.listQuery.bindTimeEnd = val ? val[1] : undefined
    },
    handleExpireTimeChange(val) {
      this.listQuery.expireTimeStart = val ? val[0] : undefined
      this.listQuery.expireTimeEnd = val ? val[1] : undefined
    }
  }
}
</script>

<style lang="scss" scoped> // 参考 TokenPaneQuery.vue
.filter-container {
  padding-bottom: 10px;
  margin-bottom: 15px; // Add margin to separate from table
}
.el-form-query {
    display: flex;
    flex-wrap: wrap;
    .el-form-item {
      margin-right: 10px;
      margin-bottom: 10px; // Add consistent bottom margin
      width: auto; // Allow items to size naturally initially
      // Adjust width for specific elements if needed
      & >>> .el-input, & >>> .el-select, & >>> .el-date-editor {
         min-width: 150px; // Ensure minimum width for inputs/selects
      }
      & >>> .el-date-editor--datetimerange.el-input__inner {
        width: 350px; // Specific width for date range picker
      }
    }
}
</style>
