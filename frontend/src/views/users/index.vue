<template>
  <div class="users-container">
    <el-card>
      <template v-slot:header>
<div  class="header">
        <span>用户管理</span>
        <el-button type="primary" size="small" @click="handleAdd">添加用户</el-button>
      </div>
</template>
      <el-table :data="userList" v-loading="loading" border>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="150">
          <template v-slot="{row}">
            <el-button type="link" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="link" size="small" class="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model:visible="dialogVisible" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.id">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
<div >
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
</template>
    </el-dialog>
  </div>
</template>

<script>
import { getUsers, addUser, updateUser, deleteUser } from '@/api/user'

export default {
  name: 'Users',
  data() {
    return {
      loading: false,
      userList: [],
      dialogVisible: false,
      dialogTitle: '',
      form: {
        username: '',
        role: '',
        email: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const { data } = await getUsers()
        this.userList = data
      } catch (error) {
        console.error('获取用户列表失败:', error)
      }
      this.loading = false
    },
    handleAdd() {
      this.dialogTitle = '添加用户'
      this.form = {
        username: '',
        role: '',
        email: '',
        password: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑用户'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该用户?', '提示', {
          type: 'warning'
        })
        await deleteUser(row.id)
        this.$message.success('删除成功')
        this.fetchData()
      } catch (error) {
        console.error('删除用户失败:', error)
      }
    },
    async handleSubmit() {
      try {
        await this.$refs.form.validate()
        if (this.form.id) {
          await updateUser(this.form)
          this.$message.success('更新成功')
        } else {
          await addUser(this.form)
          this.$message.success('添加成功')
        }
        this.dialogVisible = false
        this.fetchData()
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/apple-theme.scss';

.users-container {
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .danger {
    color: $danger-color;
  }
}
</style>