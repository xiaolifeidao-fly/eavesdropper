<template>
  <div class="tab-container" style="margin:1px;">
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
              <el-select v-model="listQuery.approveStatus" placeholder="请选择">
                <el-option
                  v-for="item in orderStatusList"
                  :key="item.label"
                  :label="item.value"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
            <el-form-item lstyle="width: 30%;" label="链接">
              <el-input v-model="listQuery.taskContent" style="width: 200px;" placeholder="作品短链" />
            </el-form-item>
            <el-form-item style="width: 30%;" label="">
              <el-button :loading="listLoading" @click="getTaskListInit()">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </el-card>
    <el-table v-loading="listLoading" :data="taskList" border fit highlight-current-row style="width: 100%">
      <el-table-column label="订单ID" width="70px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderRecordId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="链接" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.taskContent }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单数量" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提交数量" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.doneNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" width="100px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.approveStatusShow | approveStatusFilter">
            {{ row.approveStatusShow }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" width="100px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.orderStatusShow | orderStatusFilter">
            {{ row.orderStatusShow }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图审" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="taskCheckRough(row)">
            图审
          </el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="false" label="细审" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="taskCheck(row)">
            细审
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTimeStr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updateTimeStr }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getTaskList" />
  </div>
</template>

<script>
import { getTaskList } from '@/api/check'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  components: { Pagination },
  filters: {
    approveStatusFilter(status) {
      const statusMap = {
        '审核中': '',
        '审核完成': 'success'
      }
      return statusMap[status]
    },
    orderStatusFilter(status) {
      const statusMap = {
        '初始化中': 'info',
        '未开始': 'info',
        '进行中': '',
        '已完成': 'success',
        '处理失败': 'danger',
        '退单中': '',
        '退单处理中': '',
        '已退单': 'success'
      }
      return statusMap[status]
    }
  },
  props: {
    shopId: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      dyUrl: '',
      total: 0,
      taskList: [],
      orderStatusList: [{
        value: '审核中',
        label: 'CHECKING'
      }, {
        value: '审核完成',
        label: 'FINISH'
      }],
      listQuery: {
        page: 1,
        limit: 20,
        shopId: this.shopId,
        sort: '+id',
        startTime: null,
        endTime: null,
        tinyUrl: '',
        taskContent: '',
        approveStatus: ''
      },
      task: {
        id: undefined,
        shopId: undefined,
        code: '',
        orderRecordId: undefined,
        taskInstanceId: undefined,
        shopCategoryName: '',
        taskContent: '',
        orderNum: undefined,
        initNum: undefined,
        endNum: undefined,
        waitNum: undefined,
        doneNum: undefined,
        errorNum: undefined,
        orderStatus: '',
        orderStatusShow: '',
        startTime: '',
        endTime: ''
      },
      listLoading: false,
      timeRange: '',
      pickerOptions: {
        shortcuts: [{
          text: '昨天',
          onClick(picker) {
            const end = new Date(new Date().toLocaleDateString())
            const start = new Date(new Date().toLocaleDateString())
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '今天',
          onClick(picker) {
            const end = new Date(new Date().toLocaleDateString())
            const start = new Date(new Date().toLocaleDateString())
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 1)
            picker.$emit('pick', [start, end])
          }
        }, {
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
    console.log('1111111')
    this.listQuery.approveStatus = this.orderStatusList[0].label
    console.log('22222222')
    this.getTaskList()
  },
  methods: {
    getTaskList() {
      console.log('33333333')
      this.listLoading = true
      this.listQuery.startTime = this.timeRange[0]
      this.listQuery.endTime = this.timeRange[1]
      getTaskList(this.listQuery).then(response => {
        this.taskList = response.data.items
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    getTaskListInit() {
      this.listQuery.page = 1
      this.getTaskList()
    },
    taskCheck(row) {
      this.$router.push({
        path: '/check/taskDetail',
        query: {
          orderId: row.orderRecordId,
          assignId: row.id
        }
      })
    },
    taskCheckRough(row) {
      this.$router.push({
        path: '/check/taskRough',
        query: {
          orderId: row.orderRecordId,
          assignId: row.id
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  :deep(.el-input.is-disabled) .el-input__inner {
      color: #000000 !important;
  }
  .dy-iframe {
    position: absolute;
    background:#FFFFFF;
    width: 400px;
    height: 430px;
    left:400px;
    top: 40px;
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
