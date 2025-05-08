<template>
  <div class="dashboard-editor-container">
    <el-card class="box-card" style="padding:2px;">
      <div slot="header" class="card-title">
        <span style="text-align: center;display:block;font-size:35px;">公告</span>
      </div>
      <el-table
        :data="noticeList"
        stripe
        style="width: 100%"
        @cell-click="showDetail"
      >
        <el-table-column
          prop="title"
          label="标题"
          width="180"
        />
        <el-table-column
          prop="contentSlug"
          label="内容"
        />
      </el-table>
    </el-card>
    <div>
      <img :src="emptyGif" class="emptyGif">
    </div>
    <el-dialog :title="title" :visible.sync="noticeDialogVisible">
      <div>{{ content }}</div>
    </el-dialog>
  </div>
</template>

<script>
import { getAllNoticeList } from '@/api/notice'
import { mapGetters } from 'vuex'
import PanThumb from '@/components/PanThumb'
import GithubCorner from '@/components/GithubCorner'

export default {
  name: 'DashboardEditor',
  components: { PanThumb, GithubCorner },
  data() {
    return {
      emptyGif: 'https://wpimg.wallstcn.com/0e03b7da-db9e-4819-ba10-9016ddfdaed3',
      noticeList: [],
      noticeDialogVisible: false,
      title: '',
      content: ''
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles'
    ])
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      getAllNoticeList(this.listQuery).then(response => {
        this.noticeList = response.data
      })
    },
    showDetail(row, column, event, cell) {
      this.title = row.title
      this.content = row.content
      this.noticeDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
  .box-card {
    width: 480px;
    height: auto;
  }
  .emptyGif {
    display: block;
    width: 45%;
    margin: 0 auto;
  }

  ::v-deep .el-card__body {
    padding: 5px;
  }

  ::v-deep .el-dialog__title{
    text-align: center;
    display:block;
    font-size:35px;
  }

  .dashboard-editor-container {
    background-color: #e3e3e3;
    min-height: 100vh;
    padding: 20px 20px 0px;
    .pan-info-roles {
      font-size: 12px;
      font-weight: 700;
      color: #333;
      display: block;
    }
    .info-container {
      position: relative;
      margin-left: 190px;
      height: 150px;
      line-height: 200px;
      .display_name {
        font-size: 48px;
        line-height: 48px;
        color: #212121;
        position: absolute;
        top: 25px;
      }
    }
  }
</style>
