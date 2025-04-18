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
            <el-form-item style="width: 30%;" label="">
              <el-button :loading="listLoading" @click="queryAllData()">历史查询</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </el-card>
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="showTaskSummary">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="tasks" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              待定中~~~
            </div>
            <count-to :start-val="lastTotalNum" :end-val="totalNum" :duration="1500" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="showUserTaskSummary">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="peoples" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              历史人工总量
            </div>
            <count-to :start-val="lastUserTask" :end-val="userTask" :duration="1500" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shopping">
            <svg-icon icon-class="reality" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              历史实际总量
            </div>
            <count-to :start-val="lastActualDone" :end-val="actualDone" :duration="3600" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="showConsumedSummary">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="moneys" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              历史消费
            </div>
            <count-to :decimals="2" :start-val="lastConsumed" :end-val="consumed" :duration="1500" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-dialog title="历史任务数" width="30%" :visible.sync="taskTableVisible">
        <el-table :data="taskData">
          <el-table-column property="tenantName" label="租户" width="135" />
          <el-table-column property="shopName" label="商品名" width="135" />
          <el-table-column property="count" label="数量" />
        </el-table>
      </el-dialog>
      <el-dialog title="历史人工总量" width="30%" :visible.sync="userTaskTableVisible">
        <el-table :data="userTaskData">
          <el-table-column property="taskName" label="类型" width="135" />
          <el-table-column property="status" label="状态" width="135" />
          <el-table-column property="count" label="数量" />
        </el-table>
      </el-dialog>
      <el-dialog title="历史消费" width="50%" :visible.sync="consumedTableVisible">
        <el-table :data="consumedData">
          <el-table-column property="username" label="用户名" width="135" />
          <el-table-column property="remark" label="备注" width="135" />
          <el-table-column property="consumeAmount" label="消费金额" width="135" />
          <el-table-column property="refundAmount" label="退货" width="135" />
          <el-table-column property="bkAmount" label="补款" />
        </el-table>
      </el-dialog>
    </el-row>
  </div>
</template>

<script>
import { getHistoryOrderRecordSummary, getHistoryConsumeSummary, getHistoryActualTaskSummary, getHistoryUserTaskSummary } from '@/api/summary'
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      lastTotalNum: 0,
      totalNum: 0,
      lastConsumed: 0.0,
      consumed: 0.0,
      lastActualDone: 0,
      actualDone: 0,
      userTask: 0,
      lastUserTask: 0,
      listLoading: false,
      taskTableVisible: false,
      taskData: [],
      userTaskTableVisible: false,
      userTaskData: [],
      consumedTableVisible: false,
      consumedData: [],
      listQuery: {
        startTime: null,
        endTime: null
      },
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
  },
  mounted() {

  },
  methods: {
    showTaskSummary() {
      this.taskTableVisible = true
    },
    showUserTaskSummary() {
      this.userTaskTableVisible = true
    },
    showConsumedSummary() {
      this.consumedTableVisible = true
    },
    queryAllData() {
      this.listLoading = true
      this.listQuery.startTime = this.timeRange[0]
      this.listQuery.endTime = this.timeRange[1]
      this.getHistoryOrderRecordSummary()
      this.getHistoryActualTaskSummary()
      this.getHistoryConsumeSummary()
      this.getHistoryUserTaskSummary()
      clearTimeout(this.timer) // 清除延迟执行
      this.timer = setTimeout(() => { // 设置延迟执行
        this.lastTotalNum = this.totalNum
        this.lastConsumed = this.consumed
        this.lastActualDone = this.actualDone
        this.lastUserTask = this.userTask
      }, 2000)
    },
    getHistoryOrderRecordSummary() {
      getHistoryOrderRecordSummary(this.listQuery).then(response => {
        this.totalNum = response.data.totalNum
        this.taskData = response.data.detailList
      })
    },
    getHistoryActualTaskSummary() {
      getHistoryActualTaskSummary(this.listQuery).then(response => {
        this.actualDone = response.data.count
      })
    },
    getHistoryConsumeSummary() {
      getHistoryConsumeSummary(this.listQuery).then(response => {
        this.consumed = response.data.amount
        this.consumedData = response.data.detailList
      })
    },
    getHistoryUserTaskSummary() {
      getHistoryUserTaskSummary(this.listQuery).then(response => {
        this.userTask = response.data.count
        this.userTaskData = response.data.detailList
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 100)
      })
    }

  }
}
</script>

<style lang="scss" scoped>
@media (max-width:1024px) {
  :deep(.el-dialog) {
    width: 80% !important;
  }
}
.panel-group {
  margin-top: 6px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
      float: left !important;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 15px !important;
        color: rgba(0, 0, 0, 0.45);
        font-size: 10px;
        margin-bottom: 10px;
        margin-top: 16px;
      }

      .card-panel-num {
        font-size: 20px !important;
      }
    }

  .card-panel-icon {
      float: left;
      font-size: 38px !important;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    padding: 1px !important;
    width: 5%;
    height: 5%;
    margin: 0 !important;

    .svg-icon {
      // display: block;
      margin: 1px auto !important;
      float: none !important;
    }
  }
}
:deep(.el-input.is-disabled) .el-input__inner {
      color: #000000 !important;
  }
  :deep(.el-dialog__wrapper) {
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
