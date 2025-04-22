<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="showAddNotice">
        新增通告
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="noticeList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="通告标题" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="通告内容" width="450px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.contentSlug }}</span>
        </template>
      </el-table-column>
      <el-table-column label="通告编辑" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="showUpdateNotice(row)">
            修改
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="删除" align="center" width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-popover
            v-model="row.deleteVisible"
            placement="top"
            width="160"
            trigger="click"
          >
            <p>确定删除该商品吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="closeDeletePop($index)">取消</el-button>
              <el-button type="primary" size="mini" @click="deleteNotice(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" size="mini" type="danger">
              删除
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="noticeTitle" :visible.sync="editNoticeFormVisible">
      <el-form ref="noticeDataForm" :rules="rules" :model="notice" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="标题" prop="title">
          <el-input v-model="notice.title" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入通告标题" />
        </el-form-item>
        <el-form-item label="通告" prop="content">
          <el-input v-model="notice.content" type="textarea" :autosize="{ minRows: 10, maxRows: 100}" placeholder="请输入通告内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editNoticeFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createOrUpdateNotice()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getAllNoticeList, saveNotice, updateNotice, deleteNotice } from '@/api/notice'

export default {
  data() {
    return {
      tableKey: 0,
      noticeList: [],
      noticeTitle: '',
      total: 0,
      listLoading: true,
      editNoticeFormVisible: false,
      listQuery: {
        tenantName: '',
        page: 1,
        limit: 20,
        sort: '+id'
      },
      notice: {
        id: undefined,
        title: '',
        contentSlug: '',
        content: ''
      },
      rules: {
        title: [{ required: true, message: '通告标题不能为空', trigger: 'change' }],
        content: [{ required: true, message: '通告内容不能为空', trigger: 'change' }],
        tenantName: [{ required: true, message: '租户名称不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getAllNoticeList(this.listQuery).then(response => {
        this.noticeList = response.data
        this.noticeList.forEach((value, index) => {
          Object.assign(value, { deleteVisible: false })
        })
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1)
      })
    },
    showUpdateNotice(row) {
      this.noticeTitle = '修改通告'
      this.notice.id = row.id
      this.notice.title = row.title
      this.notice.content = row.content
      this.notice.contentSlug = row.contentSlug
      this.editNoticeFormVisible = true
      this.$nextTick(() => {
        this.$refs['noticeDataForm'].clearValidate()
      })
    },
    showAddNotice() {
      this.noticeTitle = '新增通告'
      this.notice.id = undefined
      this.notice.title = ''
      this.notice.content = ''
      this.notice.contentSlug = ''
      this.editNoticeFormVisible = true
      this.$nextTick(() => {
        this.$refs['noticeDataForm'].clearValidate()
      })
    },
    createOrUpdateNotice() {
      this.$refs['noticeDataForm'].validate((valid) => {
        if (valid) {
          this.editNoticeFormVisible = false
          if (this.noticeTitle === '修改通告') {
            updateNotice(this.notice).then(response => {
              this.getList()
              this.$notify({
                title: '操作成功',
                message: '修改通告成功',
                type: 'success',
                duration: 2000
              })
            })
          }
          if (this.noticeTitle === '新增通告') {
            saveNotice(this.notice).then(response => {
              this.getList()
              this.$notify({
                title: '操作成功',
                message: '添加通告成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        }
      })
    },
    closeDeletePop(index) {
      this.$set(this.noticeList, index, Object.assign(this.noticeList[index], { deleteVisible: false }))
    },
    deleteNotice(row, index) {
      deleteNotice(row.id).then(response => {
        this.getList()
        this.$notify({
          title: '操作成功',
          message: '删除通告成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>
