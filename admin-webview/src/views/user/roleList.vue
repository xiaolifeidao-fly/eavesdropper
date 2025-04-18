<template>
  <div class="app-container">
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="roleList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="角色名称" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色编码" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.code }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { getRoleList } from '@/api/user'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      roleList: [],
      total: 0,
      listLoading: true,
      listQuery: {
        roleName: '',
        page: 1,
        limit: 20,
        sort: '+id'
      },
      role: {
        id: undefined,
        name: '',
        code: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getRoleList(this.listQuery).then(response => {
        this.roleList = response.data.items
        this.total = response.data.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    }
  }
}
</script>
