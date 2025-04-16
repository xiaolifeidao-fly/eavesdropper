<template>
  <div class="tab-container" style="margin:1px;">
    <el-row :gutter="40" class="panel-group">
      <el-col v-if="!canShow()" :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="showTaskSummary">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="tasks" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              电音任务数
            </div>
            赞
            <vue-count-up :start-val="lastTotalLoveNum" :end-val="totalLoveNum" :duration="1.5" class="card-panel-num" />
            关
            <vue-count-up :start-val="lastTotalFollowNum" :end-val="totalFollowNum" :duration="1.5" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col v-if="canShow()" :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="showConsumedSummary">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="consume1" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              今日消费
            </div>
            <vue-count-up :decimals="2" :start-val="lastConsumed" :end-val="consumed" :duration="1.5" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col v-if="canShow()" :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="showRechargeSummary">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="recharge2" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              今日充值
            </div>
            <vue-count-up :decimals="2" :start-val="lastRecharge" :end-val="recharge" :duration="1.5" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col v-if="canShow()" :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="showUserAccountSummary">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="userAccount" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              系统余额
            </div>
            <vue-count-up :decimals="2" :start-val="lastUserAccount" :end-val="userAccount" :duration="1.5" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-dialog title="今日任务数" width="50%" v-model="taskTableVisible">
        <el-table :data="taskData">
          <el-table-column property="tenantName" label="租户" width="135" />
          <el-table-column property="shopName" label="商品名" width="135" />
          <el-table-column property="shopCategoryName" label="类目" width="135" />
          <el-table-column property="count" label="数量" />
        </el-table>
      </el-dialog>
      <el-dialog title="今日人工总量" width="30%" v-model="userTaskTableVisible">
        <el-table :data="userTaskData">
          <el-table-column property="taskName" label="类型" width="135" />
          <el-table-column property="status" label="状态" width="135" />
          <el-table-column property="count" label="数量" />
        </el-table>
      </el-dialog>
      <el-dialog title="昨日未跑量" width="30%" v-model="remainTaskTableVisible">
        <el-table :data="remainTaskData">
          <el-table-column property="name" label="商品" width="235" />
          <el-table-column property="totalNum" label="数量" />
        </el-table>
      </el-dialog>
      <el-dialog title="今日消费" width="50%" v-model="consumedTableVisible">
        <el-table :data="consumedData">
          <el-table-column property="username" label="用户名" width="135" />
          <el-table-column property="remark" label="备注" width="135" />
          <el-table-column property="consumeAmount" label="消费金额" width="135" />
          <el-table-column property="refundAmount" label="退货" width="135" />
          <el-table-column property="bkAmount" label="补款" />
        </el-table>
      </el-dialog>
      <el-dialog title="今日充值" width="35%" v-model="rechargeTableVisible">
        <el-table :data="rechargeData">
          <el-table-column property="username" label="用户名" width="135" />
          <el-table-column property="remark" label="备注" width="135" />
          <el-table-column property="rechargeAmount" label="充值金额" width="135" />
          <el-table-column property="givenAmount" label="赠送金额" />
        </el-table>
      </el-dialog>
      <el-dialog title="系统余额" width="30%" class="my-test" v-model="userAccountTableVisible">
        <el-table :data="userAccountData">
          <el-table-column property="username" label="用户名" width="135" />
          <el-table-column property="remark" label="备注" width="135" />
          <el-table-column property="accountAmount" label="账户余额" />
        </el-table>
      </el-dialog>
      <el-dialog title="任务总量" width="30%" v-model="remainTotalTaskTableVisible">
        <el-table :data="remainTotalTaskData">
          <el-table-column property="name" label="商品" width="235" />
          <el-table-column property="totalNum" label="数量" />
        </el-table>
      </el-dialog>
      <!-- <task-pane :shop-id="shopId" /> -->
    </el-row>
    <!-- <task-pane :business-type="businessType" :name="name" /> -->
    <div v-if="canShow()">
      <task-pane v-for="item in dashBoardConfigList" :key="item" :business-type="item.businessType" :title="item.title" />
    </div>
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart-speed :chart-data="lineChartSpeedData" />
    </el-row>
  </div>
</template>

<script>
import { getTodayOrderRecordSummary, getTodayConsumeSummary, getTodayActualTaskSummaryByBusinessCode,
  getTodayUserTaskSummary, getTodayRemainTaskSummaryByBusinessCode,
  getTodayRechargeSummary, getTodayUserAccountSummary, getTodayRemainTotalNumTaskSummaryByBusinessCode,
  getDashBoardConfig } from '@/api/summary'
import { mapGetters } from 'vuex'
import VueCountUp from 'vue-countup-v3'
import LineChartSpeed from './LineChartSpeed'
import moment from 'moment'
import TaskPane from './today/TaskPane'

export default {
  components: {
    VueCountUp,
    LineChartSpeed,
    TaskPane
  },
  data() {
    return {
      dashBoardConfigList: [],
      businessType: 'BATCH_LOW_LOVE',
      name: '特惠点赞的量',
      dyTaskActualList: [],
      lastTotalNum: 0,
      totalNum: 0,
      lastTotalLoveNum: 0,
      totalLoveNum: 0,
      lastTotalFollowNum: 0,
      totalFollowNum: 0,
      lastConsumed: 0.0,
      consumed: 0.0,
      lastRecharge: 0.0,
      recharge: 0.0,
      lastUserAccount: 0.0,
      userAccount: 0.0,
      lastActualDone: 0,
      actualDone: 0,
      userTask: 0,
      lastUserTask: 0,
      remainTask: 0,
      remainTotalTask: 0,
      lastRemainTask: 0,
      lastRemainTotalTask: 0,
      userTaskInterval: 2,
      taskTableVisible: false,
      taskData: [],
      userTaskTableVisible: false,
      userTaskData: [],
      remainTaskTableVisible: false,
      remainTaskData: [],
      remainTotalTaskTableVisible: false,
      remainTotalTaskData: [],
      consumedTableVisible: false,
      consumedData: [],
      rechargeTableVisible: false,
      rechargeData: [],
      userAccountTableVisible: false,
      userAccountData: [],
      lineChartSpeedData: {
        xData: [],
        actualData: [],
        title: '测试折线图的标题',
        actualSpeed: 0,
        personSpeed: 0,
        leftTime: 0
      },
      intervalId: null
    }
  },
  computed: {
    ...mapGetters([
      'buttonList'
    ])
  },
  created() {
    this.getDashBoardConfig()
    this.getAllData()
  },
  mounted() {
    this.intervalId = setInterval(this.getAllData, 10000)
    // setInterval(this.getTodayConsumeSummary, 5000)
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
    getDashBoardConfig() {
      getDashBoardConfig().then(response => {
        this.dashBoardConfigList = response.data
      })
    },
    showTaskSummary() {
      this.taskTableVisible = true
    },
    showUserTaskSummary() {
      this.userTaskTableVisible = true
    },
    showRemainTaskSummary() {
      this.remainTaskTableVisible = true
    },
    showRemainTotalTaskSummary() {
      this.remainTotalTaskTableVisible = true
    },
    showConsumedSummary() {
      this.consumedTableVisible = true
    },
    showRechargeSummary() {
      this.rechargeTableVisible = true
    },
    showUserAccountSummary() {
      this.userAccountTableVisible = true
    },
    getAllData() {
      this.getTodayOrderRecordSummary()
      if (this.canShow()) {
        this.getTodayConsumeSummary()
        this.getTodayRechargeSummary()
        this.getTodayUserAccountSummary()
      }
      this.getTodayActualTaskSummary()
      this.getTodayRemainTaskSummary()
      this.getTodayRemainTotalTaskSummary()

      // if (this.userTaskInterval >= 2) {
      // this.userTaskInterval = 0
      this.getTodayUserTaskSummary()
      // } else {
      // this.userTaskInterval++
      // }
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        var actualSpeepData = this.actualDone - this.lastActualDone + this.lastRemainTask - this.remainTask
        if (this.lineChartSpeedData && actualSpeepData > 0 && this.lastActualDone > 0 && this.remainTask > 0) {
          this.lineChartSpeedData.xData = this.lineChartSpeedData.xData || []
          this.lineChartSpeedData.actualData = this.lineChartSpeedData.actualData || []
          this.lineChartSpeedData.xData.push(moment(new Date()).format('HH:mm:ss'))
          this.lineChartSpeedData.actualData.push(actualSpeepData)
          this.lineChartSpeedData.actualSpeed = parseInt(actualSpeepData / 10)
          this.lineChartSpeedData.leftTime = this.lineChartSpeedData.actualSpeed > 0 ? parseInt(this.remainTotalTask / (60 * this.lineChartSpeedData.actualSpeed)) : 0
        }
        var personSpeed = this.userTask - this.lastUserTask
        if (this.lineChartSpeedData && personSpeed > 0 && this.userTask > 0 && this.lastUserTask > 0) {
          this.lineChartSpeedData.personSpeed = parseInt(personSpeed / 10)
        }
        this.lastTotalNum = this.totalNum
        this.lastTotalLoveNum = this.totalLoveNum
        this.lastTotalFollowNum = this.totalFollowNum
        this.lastConsumed = this.consumed
        this.lastActualDone = this.actualDone
        this.lastUserTask = this.userTask
        this.lastRemainTask = this.remainTask
        this.lastRemainTotalTask = this.remainTotalTask
        this.lastUserAccount = this.userAccount
      }, 2000)
    },
    getTodayOrderRecordSummary() {
      getTodayOrderRecordSummary().then(response => {
        this.totalNum = response.data.totalNum
        this.totalLoveNum = response.data.totalLoveNum
        this.totalFollowNum = response.data.totalFollowNum
        this.taskData = response.data.detailList
      })
    },
    getTodayActualTaskSummary() {
      getTodayActualTaskSummaryByBusinessCode({ 'businessCode': 'DY' }).then(response => {
        this.actualDone = response.data.count
      })
    },
    getTodayConsumeSummary() {
      getTodayConsumeSummary().then(response => {
        this.consumed = response.data.amount
        this.consumedData = response.data.detailList
      })
    },
    getTodayRechargeSummary() {
      getTodayRechargeSummary().then(response => {
        this.recharge = response.data.amount
        this.rechargeData = response.data.detailList
      })
    },
    getTodayUserTaskSummary() {
      getTodayUserTaskSummary().then(response => {
        this.userTask = response.data.count
        this.userTaskData = response.data.detailList
      })
    },
    getTodayRemainTaskSummary() {
      getTodayRemainTaskSummaryByBusinessCode({ 'businessCode': 'DY' }).then(response => {
        this.remainTaskData = response.data
        var totalNum = 0
        this.remainTaskData.forEach((value, index) => {
          totalNum += value.totalNum
        })
        this.remainTask = totalNum
      })
    },
    getTodayRemainTotalTaskSummary() {
      getTodayRemainTotalNumTaskSummaryByBusinessCode({ 'businessCode': 'DY' }).then(response => {
        this.remainTotalTaskData = response.data
        var totalNum = 0
        this.remainTotalTaskData.forEach((value, index) => {
          totalNum += value.totalNum
        })
        this.remainTotalTask = totalNum
      })
      // getTodayRemainTotalTaskSummary().then(response => {
      //   this.remainTotalTask = response.data.totalNum
      //   this.remainTotalTaskData = response.data.detailList
      // })
    },
    getTodayUserAccountSummary() {
      getTodayUserAccountSummary().then(response => {
        this.userAccount = response.data.amount
        this.userAccountData = response.data.detailList
      })
    },
    canShow() {
      if (this.buttonList.includes('DASHBOARD_RECHARGE_TODAY')) {
        return true
      } else {
        return false
      }
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
