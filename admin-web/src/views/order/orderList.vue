<template>
  <div class="tab-container" style="margin:1px;">
    <el-tabs v-model="shopCategoryId" tab-position="left" style="margin:0px;" type="border-card">
      <el-tab-pane v-for="item in tabShopCategoryOptions" :key="item.id" :label="item.name" :name="item.id">
        <keep-alive>
          <tab-pane v-if="shopCategoryId==item.id" :shop-category-id="item.id" 
            :shop-category="item.shopCategoryData" :shop-id="item.shopId" :shop="item.shopData" @create="showCreatedTimes" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getCurrentShopCategoryList, getShopList } from '@/api/shop'
import TabPane from './components/TabPane'

export default {
  name: 'Tab',
  components: { TabPane },
  data() {
    return {
      tabShopCategoryOptions: [
        { label: 'China2', key: 'CN' }
      ],
      shopList: [],
      shopCategoryList: [],
      orderList: [],
      shopCategoryId: '',
      shopCategory: {},
      shopId: '',
      shop: {},
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
      getShopList().then(response => {
        this.shopList = response.data.items
      })
      getCurrentShopCategoryList().then(response => {
        this.shopCategoryList = response.data
        this.tabShopCategoryOptions = []
        this.shopCategoryList.forEach((value, index) => {
          var currentShop = {}
          this.shopList.forEach((shopValue, shopIndex) => {
            if(value.shopId === shopValue.id) {
              currentShop = shopValue
            }
          })
          const option = {}
          option.id = value.id.toString()
          option.name = value.name
          option.code = value.code
          option.shopCategoryData = value
          option.shopData = currentShop
          option.shopId = currentShop.id
          this.tabShopCategoryOptions.push(option)
        })
        if (typeof this.shopCategoryId === 'undefined' || this.shopCategoryId == null || this.shopCategoryId === '' || this.shopCategoryId === '0') {
          this.shopCategoryId = this.shopCategoryList[0].id.toString()
        }
        console.log('shopCategoryId:原来is:' + this.shopCategoryId)
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
    font-size: 23px !important;
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
