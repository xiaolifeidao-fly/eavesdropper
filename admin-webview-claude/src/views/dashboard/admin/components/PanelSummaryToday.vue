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
            <count-to :start-val="lastTotalLoveNum" :end-val="totalLoveNum" :duration="1500" class="card-panel-num" />
            关
            <count-to :start-val="lastTotalFollowNum" :end-val="totalFollowNum" :duration="1500" class="card-panel-num" />
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
            <count-to :decimals="2" :start-val="lastConsumed" :end-val="consumed" :duration="1500" class="card-panel-num" />
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
            <count-to :decimals="2" :start-val="lastRecharge" :end-val="recharge" :duration="1500" class="card-panel-num" />
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
            <count-to :decimals="2" :start-val="lastUserAccount" :end-val="userAccount" :duration="1500" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-dialog title="今日任务数" width="50%" :visible.sync="taskTableVisible">
        <el-table :data="taskData">
          <el-table-column property="tenantName" label="租户" width="135" />
          <el-table-column property="shopName" label="商品名" width="135" />
          <el-table-column property="shopCategoryName" label="类目" width="135" />
          <el-table-column property="count" label="数量" />
        </el-table>
      </el-dialog>
      <el-dialog title="今日人工总量" width="30%" :visible.sync="userTaskTableVisible">
        <el-table :data="userTaskData">
          <el-table-column property="taskName" label="类型" width="135" />
          <el-table-column property="status" label="状态" width="135" />
          <el-table-column property="count" label="数量" />
        </el-table>
      </el-dialog>
      <el-dialog title="昨日未跑量" width="30%" :visible.sync="remainTaskTableVisible">
        <el-table :data="remainTaskData">
          <el-table-column property="name" label="商品" width="235" />
          <el-table-column property="totalNum" label="数量" />
        </el-table>
      </el-dialog>
      <el-dialog title="今日消费" width="50%" :visible.sync="consumedTableVisible">
        <el-table :data="consumedData">
          <el-table-column property="username" label="用户名" width="135" />
          <el-table-column property="remark" label="备注" width="135" />
          <el-table-column property="consumeAmount" label="消费金额" width="135" />
          <el-table-column property="refundAmount" label="退货" width="135" />
          <el-table-column property="bkAmount" label="补款" />
        </el-table>
      </el-dialog>
      <el-dialog title="今日充值" width="35%" :visible.sync="rechargeTableVisible">
        <el-table :data="rechargeData">
          <el-table-column property="username" label="用户名" width="135" />
          <el-table-column property="remark" label="备注" width="135" />
          <el-table-column property="rechargeAmount" label="充值金额" width="135" />
          <el-table-column property="givenAmount" label="赠送金额" />
        </el-table>
      </el-dialog>
      <el-dialog title="系统余额" width="30%" class="my-test" :visible.sync="userAccountTableVisible">
        <el-table :data="userAccountData">
          <el-table-column property="username" label="用户名" width="135" />
          <el-table-column property="remark" label="备注" width="135" />
          <el-table-column property="accountAmount" label="账户余额" />
        </el-table>
      </el-dialog>
      <el-dialog title="任务总量" width="30%" :visible.sync="remainTotalTaskTableVisible">
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

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as summaryAPI from '@/api/summary'
import CountTo from 'vue-count-to'
import LineChartSpeed from './LineChartSpeed'
import moment from 'moment'
import TaskPane from './today/TaskPane'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const dashBoardConfigList = ref([])
const businessType = ref('BATCH_LOW_LOVE')
const name = ref('特惠点赞的量')
const dyTaskActualList = ref([])
const lastTotalNum = ref(0)
const totalNum = ref(0)
const lastTotalLoveNum = ref(0)
const totalLoveNum = ref(0)
const lastTotalFollowNum = ref(0)
const totalFollowNum = ref(0)
const lastConsumed = ref(0.0)
const consumed = ref(0.0)
const lastRecharge = ref(0.0)
const recharge = ref(0.0)
const lastUserAccount = ref(0.0)
const userAccount = ref(0.0)
const lastActualDone = ref(0)
const actualDone = ref(0)
const userTask = ref(0)
const lastUserTask = ref(0)
const remainTask = ref(0)
const remainTotalTask = ref(0)
const lastRemainTask = ref(0)
const lastRemainTotalTask = ref(0)
const userTaskInterval = ref(2)
const taskTableVisible = ref(false)
const taskData = ref([])
const userTaskTableVisible = ref(false)
const userTaskData = ref([])
const remainTaskTableVisible = ref(false)
const remainTaskData = ref([])
const remainTotalTaskTableVisible = ref(false)
const remainTotalTaskData = ref([])
const consumedTableVisible = ref(false)
const consumedData = ref([])
const rechargeTableVisible = ref(false)
const rechargeData = ref([])
const userAccountTableVisible = ref(false)
const userAccountData = ref([])
const lineChartSpeedData = ref({
  xData: [],
  actualData: [],
  title: '测试折线图的标题',
  actualSpeed: 0,
  personSpeed: 0,
  leftTime: 0
})

let timer = null

const buttonList = computed(() => userStore.buttonList)

function canShow() {
  if (buttonList.value.includes('DASHBOARD_RECHARGE_TODAY')) {
    return true
  } else {
    return false
  }
}

function showTaskSummary() {
  taskTableVisible.value = true
}

function showUserTaskSummary() {
  userTaskTableVisible.value = true
}

function showRemainTaskSummary() {
  remainTaskTableVisible.value = true
}

function showRemainTotalTaskSummary() {
  remainTotalTaskTableVisible.value = true
}

function showConsumedSummary() {
  consumedTableVisible.value = true
}

function showRechargeSummary() {
  rechargeTableVisible.value = true
}

function showUserAccountSummary() {
  userAccountTableVisible.value = true
}

function getAllData() {
  getOrderRecordSummary()
  if (canShow()) {
    getConsumeSummary()
    getRechargeSummary()
    getUserAccountSummary()
  }
  getActualTaskSummary()
  getRemainTaskSummary()
  getRemainTotalTaskSummary()

  getTodayUserTask()
  
  clearTimeout(timer) // 清除延迟执行
  timer = setTimeout(() => { // 设置延迟执行
    // 速率折线图
    var actualSpeepData = actualDone.value - lastActualDone.value + lastRemainTask.value - remainTask.value
    if (actualSpeepData > 0 && lastActualDone.value > 0 && remainTask.value > 0) {
      lineChartSpeedData.value.xData.push(moment(new Date()).format('HH:mm:ss'))
      lineChartSpeedData.value.actualData.push(actualSpeepData)
      lineChartSpeedData.value.actualSpeed = parseInt(actualSpeepData / 10)
      lineChartSpeedData.value.leftTime = parseInt(remainTotalTask.value / (60 * lineChartSpeedData.value.actualSpeed))
    }
    var personSpeed = userTask.value - lastUserTask.value
    if (personSpeed > 0 && userTask.value > 0 && lastUserTask.value > 0) {
      lineChartSpeedData.value.personSpeed = parseInt(personSpeed / 10)
    }
    lastTotalNum.value = totalNum.value
    lastTotalLoveNum.value = totalLoveNum.value
    lastTotalFollowNum.value = totalFollowNum.value
    lastConsumed.value = consumed.value
    lastActualDone.value = actualDone.value
    lastUserTask.value = userTask.value
    lastRemainTask.value = remainTask.value
    lastRemainTotalTask.value = remainTotalTask.value
    lastUserAccount.value = userAccount.value
  }, 2000)
}

function getDashBoardConfigs() {
  summaryAPI.getDashBoardConfig().then(response => {
    dashBoardConfigList.value = response.data
  })
}

function getOrderRecordSummary() {
  summaryAPI.getTodayOrderRecordSummary().then(response => {
    totalNum.value = response.data.totalNum
    totalLoveNum.value = response.data.totalLoveNum
    totalFollowNum.value = response.data.totalFollowNum
    taskData.value = response.data.detailList
  })
}

function getActualTaskSummary() {
  summaryAPI.getTodayActualTaskSummaryByBusinessCode({ 'businessCode': 'DY' }).then(response => {
    actualDone.value = response.data.count
  })
}

function getConsumeSummary() {
  summaryAPI.getTodayConsumeSummary().then(response => {
    consumed.value = response.data.amount
    consumedData.value = response.data.detailList
  })
}

function getRechargeSummary() {
  summaryAPI.getTodayRechargeSummary().then(response => {
    recharge.value = response.data.amount
    rechargeData.value = response.data.detailList
  })
}

function getTodayUserTask() {
  summaryAPI.getTodayUserTaskSummary().then(response => {
    userTask.value = response.data.count
    userTaskData.value = response.data.detailList
  })
}

function getRemainTaskSummary() {
  summaryAPI.getTodayRemainTaskSummaryByBusinessCode({ 'businessCode': 'DY' }).then(response => {
    remainTaskData.value = response.data
    var totalNum = 0
    remainTaskData.value.forEach((value, index) => {
      totalNum += value.totalNum
    })
    remainTask.value = totalNum
  })
}

function getRemainTotalTaskSummary() {
  summaryAPI.getTodayRemainTotalNumTaskSummaryByBusinessCode({ 'businessCode': 'DY' }).then(response => {
    remainTotalTaskData.value = response.data
    var totalNum = 0
    remainTotalTaskData.value.forEach((value, index) => {
      totalNum += value.totalNum
    })
    remainTotalTask.value = totalNum
  })
}

function getUserAccountSummary() {
  summaryAPI.getTodayUserAccountSummary().then(response => {
    userAccount.value = response.data.amount
    userAccountData.value = response.data.detailList
  })
}

let intervalId = null

onMounted(() => {
  getDashBoardConfigs()
  getAllData()
  intervalId = setInterval(getAllData, 10000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (timer) clearTimeout(timer)
})
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
