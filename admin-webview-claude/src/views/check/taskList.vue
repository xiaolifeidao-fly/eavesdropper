<template>
  <div class="tab-container" style="margin:1px;">
    <el-tabs v-model="shopId" tab-position="left" style="margin:0px;" type="border-card">
      <el-tab-pane v-for="item in tabTaskCategoryOptions" :key="item.shopId" :label="item.name" :name="item.shopId">
        <keep-alive>
          <task-pane v-if="shopId==item.shopId" :shop-id="item.shopId" @create="showCreatedTimes" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getCurrentTaskCategoryList } from '@/api/check'
import TaskPane from './components/TaskPane'

export default {
  name: 'Tab',
  components: { TaskPane },
  data() {
    return {
      tabTaskCategoryOptions: [],
      taskCategoryList: [],
      shopId: '',
      listQuery: {
        page: 1,
        limit: 30,
        shopId: this.shopId,
        sort: '+id'
      },
      createdTimes: 0
    }
  },
  watch: {
    shopId(val) {
      this.$router.push(`${this.$route.path}?tab=${val}`)
    }
  },
  created() {
    // init the default selected tab
    const tab = this.$route.query.tab
    if (tab) {
      this.shopId = tab
    }
    this.getCurrentTaskCategoryList()
  },
  methods: {
    getCurrentTaskCategoryList() {
      getCurrentTaskCategoryList().then(response => {
        this.taskCategoryList = response.data
        this.tabTaskCategoryOptions = []
        this.taskCategoryList.forEach((value, index) => {
          const option = {}
          option.name = value.name
          option.shopId = value.shopId.toString()
          this.tabTaskCategoryOptions.push(option)
        })
        console.log('当前shopId:' + this.shopId)
        if (typeof this.shopId === 'undefined' || this.shopId == null || this.shopId === '' || this.shopId === '0') {
          this.shopId = this.taskCategoryList[0].shopId.toString()
        }
      })
    },
    showCreatedTimes() {
      this.createdTimes = this.createdTimes + 1
    }
  }
}
</script>

<style>
  .tab-container {
    margin: 30px;
  }
  .el-tabs__item {
    font-size: 20px !important;
  }
  .el-tabs--border-card>.el-tabs__header .el-tabs__item {
    color: black;
  }
  .el-tabs--border-card>.el-tabs__content {
    padding: 1px;
  }
  .el-tabs--left .el-tabs__header.is-left {
    float: left;
    margin-bottom: 0;
    margin-right: 2px;
  }
</style>
