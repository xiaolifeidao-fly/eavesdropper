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
              <el-button class="button" @click="checkError(taskIndex,userTask)">{{ userTask.userTaskId }}</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { getUserTaskPicList } from '@/api/check'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  currentDate: new Date(),
  name: 'ComplexTable',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      userTaskList: [],
      total: 0,
      listLoading: true,
      listQuery: {
        id: undefined,
        orderId: undefined,
        orderHash: '',
        xhsLowFollowId: undefined,
        xhsCollectId: undefined,
        xhsLoveId: undefined,
        index: undefined,
        page: 1,
        limit: 500,
        sort: '+id',
        userId: undefined,
        userSource: '',
        startTime: null,
        endTime: null,
        status: 'DONE',
        statusShow: '',
        picUrl: ''
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
      const orderHash = this.$route.query.orderHash
      const xhsLowFollowId = this.$route.query.xhsLowFollowId
      const xhsCollectId = this.$route.query.xhsCollectId
      const xhsLoveId = this.$route.query.xhsLoveId
      this.listQuery.orderHash = orderHash
      this.listQuery.xhsLowFollowId = xhsLowFollowId
      this.listQuery.xhsCollectId = xhsCollectId
      this.listQuery.xhsLoveId = xhsLoveId
      this.getList()
    },
    getList() {
      this.listLoading = true
      console.log('params is not null 开始请求')
      getUserTaskPicList(this.listQuery).then(response => {
        this.userTaskList = response.data.items
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
