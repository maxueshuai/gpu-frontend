<template>
  <div class="business-logs">
    <div class="header">
      <h2>业务日志</h2>
    </div>
    <el-table :data="logList" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="timestamp" label="时间" width="180" />
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="row.type === 'error' ? 'danger' : 'info'">
            {{ row.type === 'error' ? '错误' : '信息' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="消息" />
      <el-table-column prop="source" label="来源" width="120" />
    </el-table>
    <div class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { getBusinessLogs } from '@/api/logs'

export default {
  name: 'BusinessLogs',
  data() {
    return {
      logList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const response = await getBusinessLogs({
          page: this.currentPage,
          pageSize: this.pageSize
        })
        this.logList = response.data.items
        this.total = response.data.total
      } catch (error) {
        console.error('获取业务日志失败:', error)
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    }
  }
}
</script>

<style scoped>
.business-logs {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>