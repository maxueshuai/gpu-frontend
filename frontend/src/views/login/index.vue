<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h3 class="login-title">GPU服务器监控系统</h3>
      </template>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        autocomplete="on"
        label-position="left"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            type="text"
            autocomplete="on"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="密码"
            :type="passwordVisible ? 'text' : 'password'"
            autocomplete="on"
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

        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <el-link type="primary" class="float-right" @click="toRegister">注册账号</el-link>
        </el-form-item>

        <el-form-item>
          <el-button 
            :loading="loading" 
            type="primary" 
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'

export default {
  name: 'LoginPage',
  components: {
    User,
    Lock,
    View,
    Hide
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const loginFormRef = ref(null)
    const loading = ref(false)
    const passwordVisible = ref(false)

    const loginForm = reactive({
      username: '',
      password: '',
      remember: false
    })

    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
      ]
    }

    const handleLogin = () => {
      loginFormRef.value.validate(async valid => {
        if (valid) {
          loading.value = true
          try {
            console.log('开始登录...')
            await store.dispatch('user/login', loginForm)
            console.log('登录成功，获取用户信息...')
            await store.dispatch('user/getInfo')
            console.log('用户信息获取成功，准备跳转...')
            
            const redirect = route.query.redirect || '/dashboard'
            console.log('跳转目标:', redirect)
            
            ElMessage.success('登录成功')
            // 确保消息显示后再跳转
            setTimeout(() => {
              router.push(redirect)
            }, 500)
          } catch (error) {
            console.error('登录失败:', error)
            ElMessage.error(error.message || '登录失败')
          } finally {
            loading.value = false
          }
        }
      })
    }

    const toRegister = () => {
      router.push('/register')
    }

    return {
      loginForm,
      loginRules,
      loginFormRef,
      loading,
      passwordVisible,
      handleLogin,
      toRegister
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;

  .login-card {
    width: 400px;
    
    .login-title {
      text-align: center;
      font-size: 20px;
      color: #303133;
      margin: 0;
    }

    .login-form {
      margin-top: 20px;
    }

    .float-right {
      float: right;
    }

    .cursor-pointer {
      cursor: pointer;
    }
  }
}
</style> 