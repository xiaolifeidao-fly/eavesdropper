<template>
  <div class="tab-container" style="margin:1px;">
    <el-tabs v-model="shopCategoryId" tab-position="left" style="margin:0px;" type="border-card">
      <el-tab-pane v-for="item in tabShopOptions" :key="item.id" :label="item.name" :name="item.id">
        <keep-alive>
          <tab-pane-query v-if="shopCategoryId==item.id" :shop-category-id="item.id" @create="showCreatedTimes" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getCurrentShopCategoryList } from '@/api/shop'
import TabPaneQuery from './components/TabPaneQuery'

export default {
  name: 'Tab',
  components: { TabPaneQuery },
  data() {
    return {
      tabShopOptions: [
        { label: 'China2', key: 'CN' }
      ],
      shopCategoryList: [],
      orderList: [],
      shopCategoryId: '',
      listQuery: {
        page: 1,
        limit: 5,
        shopCategoryId: this.shopCategoryId,
        sort: '+id'
      },
      createdTimes: 0
    }
  },
  watch: {
    shopCategoryId(val) {
      this.$router.push(`${this.$route.path}?tab=${val}`)
    }
  },
  created() {
    // init the default selected tab
    const tab = this.$route.query.tab
    if (tab) {
      this.shopCategoryId = tab
    }
    this.getCurrentShopCategoryList()
  },
  methods: {
    getCurrentShopCategoryList() {
      getCurrentShopCategoryList().then(response => {
        this.shopCategoryList = response.data
        this.tabShopOptions = []
        this.shopCategoryList.forEach((value, index) => {
          const option = {}
          option.id = value.id.toString()
          option.name = value.name
          option.code = value.code
          this.tabShopOptions.push(option)
        })
        if (typeof this.shopCategoryId === 'undefined' || this.shopCategoryId == null || this.shopCategoryId === '' || this.shopCategoryId === '0') {
          this.shopCategoryId = this.shopCategoryList[0].id.toString()
        }
      })
    },
    showCreatedTimes() {
      this.createdTimes = this.createdTimes + 1
    },
    getOrderList() {
      console.log('getOrderList~~~')
      this.orderList = [{ 'type': 'dasd' }]
    },
    editOrder() {

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
