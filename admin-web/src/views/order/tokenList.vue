<template>
  <div class="app-container">
    <!-- Optimized Filter Section -->
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" label-width="80px">
        <el-row :gutter="10" style="margin-bottom: 10px;">
          <el-col :span="6">
            <el-form-item label="订单号">
              <el-input v-model="listQuery.orderRecordId" placeholder="订单号" clearable @keyup.enter.native="handleFilter" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="激活码">
              <el-input v-model="listQuery.token" placeholder="激活码" clearable @keyup.enter.native="handleFilter" />
            </el-form-item>
          </el-col>
           <el-col :span="6">
            <el-form-item label="店铺名称">
              <el-input v-model="listQuery.tbShopName" placeholder="店铺名称" clearable @keyup.enter.native="handleFilter" />
            </el-form-item>
          </el-col>
           <el-col :span="6">
            <el-form-item label="店铺ID">
              <el-input v-model="listQuery.tbShopId" placeholder="店铺ID" clearable @keyup.enter.native="handleFilter" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10" style="margin-bottom: 10px;">
          <el-col :span="6">
             <el-form-item label="状态">
              <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 100%;">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
           <el-col :span="9">
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
                 style="width: 100%;"
                 @change="handleCreateTimeChange"
               />
             </el-form-item>
           </el-col>
            <el-col :span="9">
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
                  style="width: 100%;"
                  @change="handleBindTimeChange"
                />
              </el-form-item>
            </el-col>
         </el-row>
          <el-row :gutter="10">
             <el-col :span="9">
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
                  style="width: 100%;"
                  @change="handleExpireTimeChange"
                />
               </el-form-item>
             </el-col>
            <el-col :span="4">
               <!-- Adjust span or add offset for button alignment -->
              <el-form-item label-width="0px"> <!-- Remove label spacing for button -->
                <el-button v-waves type="primary" icon="el-icon-search" @click="handleFilter">
                  查询
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
      </el-form>
    </div>

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
import { queryTokenList } from '@/api/order'
import TokenTable from './components/TokenTable'
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
  name: 'TokenList',
  components: { TokenTable },
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
        bindTimeStart: undefined,
        bindTimeEnd: undefined,
        createTimeStart: undefined,
        createTimeEnd: undefined,
        expireTimeStart: undefined,
        expireTimeEnd: undefined
        // 用户视图不需要 userId，API 会自动处理
      },
      // Use the defined structured options
      statusOptions: statusOptions,
      // Add data properties for date range pickers
      createTimeRange: [],
      bindTimeRange: [],
      expireTimeRange: [],
      pickerOptions: { // Same as in TokenQuery.vue
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
       // Clean up query params before sending
      const query = {}
      for (const key in this.listQuery) {
        if (this.listQuery[key] !== undefined && this.listQuery[key] !== null && this.listQuery[key] !== '') {
           query[key] = this.listQuery[key]
        }
      }
      queryTokenList(query).then(response => {
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
    // Add handler methods for date range pickers
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

<style lang="scss" scoped>
.filter-container {
  padding: 15px 0;
}
/* Remove bottom margin from form items inside rows for better alignment */
/* Add margin-bottom to el-row instead */
/* .el-row .el-form-item {
  margin-bottom: 0;
} */
/* Ensure inputs/selects inside form items take full width */
.el-form-item .el-input,
.el-form-item .el-select {
  width: 100%;
}
/* Ensure date pickers inside form items take full width */
.el-form-item .el-date-editor {
   width: 100%;
}
</style>
