<template>
  <div>
    <el-table v-loading="listLoading" :data="tokenList" border fit highlight-current-row style="width: 100%">
      <el-table-column label="ID" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单号" width="80px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.orderRecordId }}</span>
          </template>
        </el-table-column>
      <el-table-column label="Token" min-width="220px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.token }}</span>
        </template>
      </el-table-column>
      <el-table-column label="外部ID" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tbExternalId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺名称" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tbShopName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺ID" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tbShopId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusBindFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tokenCreateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绑定时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.bindTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.expireTime }}</span>
        </template>
      </el-table-column>
      <!-- 根据需要可以添加更多列，例如 UserId, AccountId -->
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handlePagination" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'TokenTable',
  components: { Pagination },
  filters: {
    // Filter for tag type/color, now accepts Chinese status text
    statusBindFilter(status) {
      const statusMap = {
        '未绑定': 'info',
        '绑定中': '',
        '已绑定': 'success',
        '绑定失败': 'danger',
        '授权过期': 'warning',
        '已解绑': 'info',
        '已禁用': 'danger'
      }
      return statusMap[status] || 'info' // Default to info if status not found
    }
  },
  props: {
    tokenList: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      default: 0
    },
    listQuery: {
      type: Object,
      required: true
    }
  },
  methods: {
    handlePagination() {
      this.$emit('pagination')
    }
  }
}
</script> 