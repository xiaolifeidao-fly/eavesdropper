<template>
  <div class="tab-container">
    <el-card class="box-card">
      <section class="card-content caling-info">
        <div class="base-info">
          <el-form class="el-form-query" label-width="80px">
            <el-form-item style="width: 30%;" label="时间范围">
              <el-date-picker
                v-model="timeRange"
                value-format="yyyy-MM-dd HH:mm:SS"
                type="datetimerange"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right"
              />
            </el-form-item>
            <el-form-item style="visibility:hidden;" label="管理key">
              <el-input />
            </el-form-item>
            <el-form-item style="width: 30%;" label="状态">
              <el-select v-model="listQuery.statusShow" placeholder="请选择">
                <el-option
                  v-for="item in userTaskStatusList"
                  :key="item.value"
                  :label="item.value"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item style="width: 30%;" label="用户ID">
              <el-input v-model="listQuery.userId" />
            </el-form-item>
            <el-form-item style="width: 30%;" label="">
              <el-button type="primary" icon="el-icon-search" @click="getList">
                查询
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </el-card>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="userTaskList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户渠道" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.userSource }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.statusShow | statusFilter">
            {{ row.statusShow }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审图" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="showCheckDialog(scope)">
            审图
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="审核人" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updateBy }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTimeStr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updateTimeStr }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="审图" :visible.sync="checkDialogVisible" width="40%" style="margin-top:1px">
      <div class="block">
        <el-image :src="picUrl" style="width: 360px; height: 500px">
          <div slot="placeholder" class="image-slot">
            加载中<span class="dot">...</span>
          </div>
          <div slot="error" class="image-slot">
            <i class="el-icon-picture-outline" />
          </div>
        </el-image>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="success" @click="checkResult('DONE')">
          成功
        </el-button>
        <el-button type="danger" @click="checkResult('ERROR')">
          失败
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserTaskList, saveCheckResult } from '@/api/check'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '初始化中': 'info',
        '审核中': '',
        '完成': 'success',
        '失败': 'danger',
        '失效': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      userTaskList: [],
      index: undefined,
      picUrl: '',
      userTaskId: undefined,
      userTaskStatusList: [{ 'value': '初始化中' }, { 'value': '审核中' }, { 'value': '完成' },
        { 'value': '失败' }, { 'value': '失效' }],
      total: 0,
      timeRange: '',
      listLoading: true,
      listQuery: {
        id: undefined,
        orderId: undefined,
        index: undefined,
        page: 1,
        limit: 50,
        sort: '+id',
        userId: undefined,
        userSource: '',
        startTime: null,
        endTime: null,
        status: '',
        statusShow: '',
        picUrl: ''
      },
      checkDialogVisible: false,
      pickerOptions: {
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
  watch: {
    '$route': 'getParams'
  },
  created() {
    const self = this
    self.getParams()
  },
  methods: {
    getParams() {
      const orderId = this.$route.query.orderId
      this.listQuery.orderId = orderId
      this.getList()
    },
    getList() {
      this.listLoading = true
      this.listQuery.startTime = this.timeRange[0]
      this.listQuery.endTime = this.timeRange[1]
      console.log('params is not null 开始请求')
      getUserTaskList(this.listQuery).then(response => {
        this.userTaskList = response.data.items
        this.total = response.data.total
        // 初始化审图图片等
        this.index = 0
        this.picUrl = this.userTaskList[this.index].picUrl
        this.userTaskId = this.userTaskList[this.index].userTaskId
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    showCheckDialog({ $index, row }) {
      this.checkDialogVisible = true
      this.index = $index
      this.picUrl = row.picUrl
      this.userTaskId = row.userTaskId
    },
    checkResult(checkResult) {
      const userTaskIds = []
      userTaskIds.push(this.userTaskId)
      saveCheckResult({ userTaskIds: userTaskIds, result: checkResult })
      this.index++
      if (this.index >= this.userTaskList.length) {
        // TOOD 请求
        this.listQuery.page++
        this.getList()
      } else {
        this.picUrl = this.userTaskList[this.index].picUrl
        this.userTaskId = this.userTaskList[this.index].userTaskId
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  >>> .el-input.is-disabled .el-input__inner {
      color: #000000 !important;
  }
  ::v-deep .el-dialog__wrapper {
    top:-100px !important;
  }
  .base-info {
    width: 70%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .el-form-query {
      width: 100%;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
  }
  .calling-icon {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    line-height: 40px;
    text-align: center;
    font-size: 32px;
    background: green;
    color: #fff;
    margin-right: 80px;
  }
  .recording-infos {
    width: 100%;
  }
  .content-textarea {
    width: 100%;
  }
  .el-card {
    margin-bottom: 5px;
  }

</style>
