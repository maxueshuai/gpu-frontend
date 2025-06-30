<template>
  <div class="mongo-servers">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>MongoDB服务器管理</span>
          <el-button type="primary" @click="handleAdd">添加服务器</el-button>
        </div>
      </template>
      
      <el-table :data="servers" style="width: 100%">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="ip" label="IP地址" />
        <el-table-column prop="port" label="端口" />
        <el-table-column prop="database" label="数据库" />
        <el-table-column prop="collection" label="集合" />
        <el-table-column prop="last_sync" label="最后同步时间" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            <el-button size="small" type="success" @click="handleSync(scope.row)">同步</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input-number v-model="form.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item label="数据库" prop="database">
          <el-input v-model="form.database" />
        </el-form-item>
        <el-form-item label="集合" prop="collection">
          <el-input v-model="form.collection" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMongoServers, createMongoServer, updateMongoServer, deleteMongoServer, syncMongoServer } from '@/api/mongo'

export default {
  name: 'MongoServers',
  setup() {
    const servers = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const formRef = ref(null)
    const form = ref({
      name: '',
      ip: '',
      port: 27017,
      username: '',
      password: '',
      database: '',
      collection: ''
    })

    const rules = {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
      port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
      database: [{ required: true, message: '请输入数据库名', trigger: 'blur' }],
      collection: [{ required: true, message: '请输入集合名', trigger: 'blur' }]
    }

    const fetchServers = async () => {
      try {
        const response = await getMongoServers()
        servers.value = response.data
      } catch (error) {
        ElMessage.error('获取服务器列表失败')
      }
    }

    const handleAdd = () => {
      dialogTitle.value = '添加服务器'
      form.value = {
        name: '',
        ip: '',
        port: 27017,
        username: '',
        password: '',
        database: '',
        collection: ''
      }
      dialogVisible.value = true
    }

    const handleEdit = (row) => {
      dialogTitle.value = '编辑服务器'
      form.value = { ...row }
      dialogVisible.value = true
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm('确定要删除该服务器吗？', '提示', {
          type: 'warning'
        })
        await deleteMongoServer(row.id)
        ElMessage.success('删除成功')
        fetchServers()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    const handleSync = async (row) => {
      try {
        await syncMongoServer(row.id)
        ElMessage.success('同步成功')
        fetchServers()
      } catch (error) {
        ElMessage.error('同步失败')
      }
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        if (form.value.id) {
          await updateMongoServer(form.value.id, form.value)
          ElMessage.success('更新成功')
        } else {
          await createMongoServer(form.value)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        fetchServers()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    onMounted(() => {
      fetchServers()
    })

    return {
      servers,
      dialogVisible,
      dialogTitle,
      form,
      formRef,
      rules,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSync,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.mongo-servers {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style> 