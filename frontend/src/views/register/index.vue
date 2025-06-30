<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h3 class="register-title">注册账号</h3>
      </template>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        label-position="left"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名"
            type="text"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            placeholder="密码"
            :type="passwordVisible ? 'text' : 'password'"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
            <template #suffix>
              <el-icon 
                class="cursor-pointer" 
                @click="passwordVisible = !passwordVisible"
              >
                <View v-if="passwordVisible" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            placeholder="确认密码"
            :type="confirmPasswordVisible ? 'text' : 'password'"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
            <template #suffix>
              <el-icon 
                class="cursor-pointer" 
                @click="confirmPasswordVisible = !confirmPasswordVisible"
              >
                <View v-if="confirmPasswordVisible" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="邮箱"
            type="email"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button 
            :loading="loading" 
            type="primary" 
            style="width: 100%"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-link type="primary" @click="toLogin">已有账号？立即登录</el-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, View, Hide } from '@element-plus/icons-vue'
import { register } from '@/api/user'

export default {
  name: 'RegisterPage',
  components: {
    User,
    Lock,
    Message,
    View,
    Hide
  },
  setup() {
    const router = useRouter()
    const registerFormRef = ref(null)
    const loading = ref(false)
    const passwordVisible = ref(false)
    const confirmPasswordVisible = ref(false)

    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (value.length < 6) {
        callback(new Error('密码长度不能小于6位'))
      } else {
        if (registerForm.confirmPassword !== '') {
          registerFormRef.value.validateField('confirmPassword')
        }
        callback()
      }
    }

    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    const registerForm = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      email: ''
    })

    const registerRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
      ],
      password: [
        { validator: validatePass, trigger: 'blur' }
      ],
      confirmPassword: [
        { validator: validatePass2, trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ]
    }

    const handleRegister = () => {
      registerFormRef.value.validate(async valid => {
        if (valid) {
          loading.value = true
          try {
            const { username, password, email } = registerForm
            await register({ username, password, email })
            ElMessage.success('注册成功')
            router.push('/login')
          } catch (error) {
            console.error('注册失败:', error)
            ElMessage.error(error.message || '注册失败')
          } finally {
            loading.value = false
          }
        }
      })
    }

    const toLogin = () => {
      router.push('/login')
    }

    return {
      registerForm,
      registerRules,
      registerFormRef,
      loading,
      passwordVisible,
      confirmPasswordVisible,
      handleRegister,
      toLogin
    }
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;

  .register-card {
    width: 400px;
    
    .register-title {
      text-align: center;
      font-size: 20px;
      color: #303133;
      margin: 0;
    }

    .register-form {
      margin-top: 20px;
    }

    .cursor-pointer {
      cursor: pointer;
    }
  }
}
</style> 