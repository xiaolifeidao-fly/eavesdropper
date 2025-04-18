<template>
  <div class="tab-container" style="margin:1px;">
    <el-card class="box-card">
      <section class="card-content caling-info">
        <div class="base-info">
          <el-form class="el-form-query" label-width="80px">
            <el-form-item style="width: 30%;" label="任务">
              <el-select v-model="businessType" placeholder="请选择">
                <el-option
                  v-for="item in businessOption"
                  :key="item.label"
                  :label="item.value"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
            <el-form-item style="width: 30%;" label="">
              <el-button :loading="listLoading" @click="queryData()">昨日渠道查询</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </el-card>
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <bar-chart-source :chart-data="barChartSourceData" />
    </el-row>
  </div>
</template>

<script>
import { getDashBoardConfig } from '@/api/summary'
import { mapGetters } from 'vuex'
import BarChartSource from './BarChartSource'

export default {
  components: {
    BarChartSource
  },
  data() {
    return {
      businessType: '',
      businessOption: [{ value: '上号情况', label: 'UIDS' }, { value: '电音点赞', label: 'BATCH_LOVE' }, { value: '电音关注', label: 'BATCH_FOLLOW' }],
      barChartSourceData: {
        xData: ['shen11', 'shen10', 'shen1', 'shen2', 'shen3', 'shen4', 'shen5', 'shen6', 'shen7', 'shen8', 'shen9', 'shen12', 'shen13', 'shen15'],
        actualData: [4340, 45, 77, 96, 103, 431, 654, 276, 1144, 345, 876, 123, 13, 5]
      }
    }
  },
  computed: {
    ...mapGetters([
      'buttonList'
    ])
  },
  created() {
  },
  methods: {
    queryData() {
      console.log('sssssssssss:start')
      this.barChartSourceData.xData.push('LZ')
      this.barChartSourceData.actualData.push(100)
      console.log('sssssssssss:end')
    }
  }
}
</script>

<style lang="scss" scoped>
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
