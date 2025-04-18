<template>
  <div class="tab-container">
    <el-row>
      <el-col v-for="(userTask, taskIndex) in userTaskList" :key="taskIndex" :span="8" style="width:220px">
        <el-card :body-style="{ padding: '0px' }" style="width:200px">
          <img :src="userTask.picUrl" class="image">
          <div style="padding:7px;">
            <span>{{ userTask.id }}</span>
            <div class="bottom clearfix">
              <span v-if="userTask.status == 'ERROR' || userTask.status == 'EXPIRE'" class="time">任务失败</span>
              <el-button class="button" @click="checkError(taskIndex,userTask)">拒绝通过</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-card class="box-card">
      <section class="card-content caling-info">
        <div class="base-info">
          <el-form class="el-form-query" label-width="80px">
            <el-form-item style="width: 30%;" label="">
              <el-button type="primary" icon="el-icon-search" @click="checkAllDone">
                批量通过
              </el-button>
            </el-form-item>
            <el-form-item style="width: 30%;" label="">
              <el-button type="primary" icon="el-icon-search" @click="finishTask">
                完结此单
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </el-card>
  </div>
</template>

<script>
import { getUserTaskList, saveCheckResult, finishTask } from '@/api/check'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  currentDate: new Date(),
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
      total: 0,
      timeRange: '',
      listLoading: true,
      listQuery: {
        id: undefined,
        orderId: undefined,
        assignId: undefined,
        index: undefined,
        page: 1,
        limit: 50,
        sort: '+id',
        userId: undefined,
        userSource: '',
        startTime: null,
        endTime: null,
        status: 'WAIT',
        statusShow: '',
        picUrl: ''
      },
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
      const assignId = this.$route.query.assignId
      this.listQuery.orderId = orderId
      this.listQuery.assignId = assignId
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

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    checkError(taskIndex, userTask) {
      console.log('显示的id:' + taskIndex)
      // this.userTaskList[taskIndex].status = 'ERROR'
      const userTaskIds = []
      userTaskIds.push(userTask.userTaskId)
      saveCheckResult({ userTaskIds: userTaskIds, result: 'ERROR' }).then(response => {
        this.userTaskList.splice(taskIndex, 1)
        this.$notify({
          title: '操作成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    checkAllDone() {
      const userTaskIds = []
      this.userTaskList.forEach((value, index) => {
        userTaskIds.push(value.userTaskId)
      })
      saveCheckResult({ userTaskIds: userTaskIds, result: 'DONE' }).then(response => {
        this.$notify({
          title: '操作成功',
          message: '批量通过成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    finishTask() {
      finishTask(this.listQuery.assignId).then(response => {
        this.$notify({
          title: '操作成功',
          message: '单子已完结',
          type: 'success',
          duration: 2000
        })
        this.$router.push({
          path: '/check/taskList'
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .time {
    font-size: 13px;
    color: fuchsia;
    font-weight:bold;
  }

  .bottom {
    margin-top: 8px;
    line-height: 15px;
  }

  .button {
    padding: 0;
    float: right;
    color: red;
    background: white;
    font-weight:bold;
    font-size: 20px;
  }

  .image {
    width: 200px;
    height: 350px;
    display: block;
  }

  .clearfix:before,
  .clearfix:after {
      display: table;
      content: "";
  }

  .clearfix:after {
      clear: both
  }

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
