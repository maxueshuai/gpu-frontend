<template>
  <div class="user-manage">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">添加用户</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
              <el-option label="管理员" value="admin" />
              <el-option label="普通用户" value="user" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用户列表 -->
      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'info'">
              {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="'active'"
              :inactive-value="'inactive'"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="last_login" label="最后登录" width="180" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="primary" link @click="handleResetPassword(scope.row)">重置密码</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

      <!-- 添加/编辑用户对话框 -->
      <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form
          ref="userForm"
          :model="userForm"
          :rules="userRules"
          label-width="100px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username" :disabled="!!userForm.id" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" />
          </el-form-item>
          <el-form-item label="密码" prop="password" v-if="!userForm.id">
            <el-input v-model="userForm.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="userForm.role" placeholder="请选择角色">
              <el-option label="管理员" value="admin" />
              <el-option label="普通用户" value="user" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="userForm.status"
              :active-value="'active'"
              :inactive-value="'inactive'"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 重置密码对话框 -->
      <el-dialog
        title="重置密码"
        v-model="resetPasswordVisible"
        width="400px"
        :close-on-click-modal="false"
      >
        <el-form
          ref="resetPasswordForm"
          :model="resetPasswordForm"
          :rules="resetPasswordRules"
          label-width="100px"
        >
          <el-form-item label="新密码" prop="password">
            <el-input v-model="resetPasswordForm.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="resetPasswordForm.confirmPassword" type="password" show-password />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="resetPasswordVisible = false">取消</el-button>
            <el-button type="primary" @click="handleResetPasswordSubmit">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword
} from '@/api/user'

// 搜索表单
const searchForm = reactive({
  username: '',
  role: '',
  status: ''
})

// 用户列表数据
const userList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框控制
const dialogVisible = ref(false)
const dialogTitle = ref('')
const resetPasswordVisible = ref(false)

// 表单数据
const userForm = reactive({
  id: null,
  username: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active'
})

const resetPasswordForm = reactive({
  id: null,
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const resetPasswordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetPasswordForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: currentPage.value,
      size: pageSize.value,
      ...searchForm
    })
    userList.value = res.users
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

// 添加用户
const handleAdd = () => {
  dialogTitle.value = '添加用户'
  Object.keys(userForm).forEach(key => {
    userForm[key] = key === 'role' ? 'user' : key === 'status' ? 'active' : ''
  })
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  Object.keys(userForm).forEach(key => {
    userForm[key] = row[key]
  })
  dialogVisible.value = true
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchUserList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    if (userForm.id) {
      await updateUser(userForm.id, userForm)
      ElMessage.success('更新成功')
    } else {
      await createUser(userForm)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchUserList()
  } catch (error) {
    ElMessage.error(userForm.id ? '更新失败' : '创建失败')
  }
}

// 重置密码
const handleResetPassword = (row) => {
  resetPasswordForm.id = row.id
  resetPasswordForm.password = ''
  resetPasswordForm.confirmPassword = ''
  resetPasswordVisible.value = true
}

// 提交重置密码
const handleResetPasswordSubmit = async () => {
  try {
    await resetUserPassword(resetPasswordForm.id, resetPasswordForm.password)
    ElMessage.success('重置密码成功')
    resetPasswordVisible.value = false
  } catch (error) {
    ElMessage.error('重置密码失败')
  }
}

// 状态变更
const handleStatusChange = async (row) => {
  try {
    await updateUser(row.id, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 'active' ? 'inactive' : 'active'
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUserList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUserList()
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>