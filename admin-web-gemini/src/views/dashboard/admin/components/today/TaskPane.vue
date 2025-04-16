<template>
  <div>
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="tasks" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description" style="margin-top:16px">
            <div class="card-panel-text" style="margin-bottom:1px;margin-right:26px">
              {{ title }}
            </div>
            <div>
              单量
              <vue-count-up :start-val="lastTaskCount" :end-val="taskCount" :duration="1.5" class="card-panel-num" />
            </div>
            <div>
              总量
              <vue-count-up :start-val="lastTaskNum" :end-val="taskNum" :duration="1.5" class="card-panel-num" />
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="showUserTaskNumDataVisible">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="peoples" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              {{ title }}人工总量
            </div>
            <vue-count-up :start-val="lastUserTaskNum" :end-val="userTaskNum" :duration="1.5" class="card-panel-num" />
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
              {{ title }}完成总量
            </div>
            <vue-count-up :start-val="lastActualTaskNum" :end-val="actualTaskNum" :duration="3.6" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shopping">
            <svg-icon icon-class="yesterday" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              {{ title }}昨日未跑
            </div>
            <vue-count-up :start-val="lastRemainTaskNum" :end-val="remainTaskNum" :duration="3.6" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-dialog :title="userTaskNumTitle" width="30%" v-model="userTaskNumDataVisible">
        <el-table :data="userTaskNumData">
          <el-table-column property="taskName" label="类型" width="135" />
          <el-table-column property="status" label="状态" width="135" />
          <el-table-column property="count" label="数量" />
        </el-table>
      </el-dialog>
    </el-row>
  </div>
</template>

<script>
import { getTodayOrderRecordCountSummaryByBusinessType, getTodayOrderRecordNumSummaryByBusinessType,
  getTodayUserTaskSummaryByBusinessType, getTodayActualTaskSummaryByBusinessType, getTodayRemainTaskSummaryByBusinessType } from '@/api/summary'
import VueCountUp from 'vue-countup-v3'
export default {
  components: {
    VueCountUp
  },
  props: {
    title: {
      type: String,
      default: '0'
    },
    businessType: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      lastTaskCount: 0,
      taskCount: 0,
      lastTaskNum: 0,
      taskNum: 0,
      taskNumData: [],
      taskNumDataVisible: false,
      lastUserTaskNum: 0,
      userTaskNum: 0,
      userTaskNumData: [],
      userTaskNumDataVisible: false,
      userTaskNumTitle: this.title + '人工总量',
      lastActualTaskNum: 0,
      actualTaskNum: 0,
      lastRemainTaskNum: 0,
      remainTaskNum: 0,
      userTaskInterval: 2,
      intervalId: null,
      timer: null
    }
  },
  created() {
    this.getAllData()
    this.getUserTaskNum()
  },
  mounted() {
    this.intervalId = setInterval(this.getAllData, 10000)
  },
  beforeUnmount() {
    if (this.intervalId) {
        clearInterval(this.intervalId)
    }
    if (this.timer) {
        clearTimeout(this.timer)
    }
  },
  methods: {
    getAllData() {
      this.getTaskCount()
      this.getTaskNum()
      this.getActualTaskNum()
      this.getRemainTaskNum()
      this.getUserTaskNum()
      if (this.timer) {
          clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.lastTaskCount = this.taskCount
        this.lastTaskNum = this.taskNum
        this.lastUserTaskNum = this.userTaskNum
        this.lastActualTaskNum = this.actualTaskNum
        this.lastRemainTaskNum = this.remainTaskNum
      }, 2000)
    },
    getTaskCount() {
      getTodayOrderRecordCountSummaryByBusinessType({ 'businessType': this.businessType }).then(response => {
        this.taskCount = response.data.totalCount
      })
    },
    getTaskNum() {
      getTodayOrderRecordNumSummaryByBusinessType({ 'businessType': this.businessType }).then(response => {
        this.taskNumData = response.data
        var totalNum = 0
        this.taskNumData.forEach((value, index) => {
          totalNum += value.totalNum
        })
        this.taskNum = totalNum
      })
    },
    getActualTaskNum() {
      getTodayActualTaskSummaryByBusinessType({ 'businessType': this.businessType }).then(response => {
        this.actualTaskNum = response.data.count
      })
    },
    getRemainTaskNum() {
      getTodayRemainTaskSummaryByBusinessType({ 'businessType': this.businessType }).then(response => {
        var remainTaskData = response.data
        var totalNum = 0
        remainTaskData.forEach((value, index) => {
          totalNum += value.totalNum
        })
        this.remainTaskNum = totalNum
      })
    },
    getUserTaskNum() {
      getTodayUserTaskSummaryByBusinessType({ 'businessType': this.businessType }).then(response => {
        this.userTaskNum = response.data.count
        this.userTaskNumData = response.data.detailList
      })
    },
    showUserTaskNumDataVisible() {
      this.userTaskNumDataVisible = true
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
        background: #8A2BE2;
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
      color: #8A2BE2;
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
      float: left;
      font-weight: bold;
      margin-left: 1px;
      margin-right: 1px;
      margin-top: 26px;
      margin-bottom: 26px;

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
  .el-dialog {
    width: 100% !important;
    left: 110 !important;
  }
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
        font-size: 15px !important;
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

// @media (max-width:550px) {
//   .card-panel-description {
//     display: none;
//   }

//   .card-panel-icon-wrapper {
//     float: none !important;
//     width: 100%;
//     height: 100%;
//     margin: 0 !important;

//     .svg-icon {
//       display: block;
//       margin: 14px auto !important;
//       float: none !important;
//     }
//   }
// }
</style>
