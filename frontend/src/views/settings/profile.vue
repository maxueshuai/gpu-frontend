<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>个人设置</h3>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="头像">
              <el-upload
                class="avatar-uploader"
                action="/api/user/avatar"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="basicForm.avatar" :src="basicForm.avatar" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <el-form-item label="用户名" prop="username">
              <el-input v-model="basicForm.username" disabled />
            </el-form-item>

            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="basicForm.nickname" placeholder="请输入昵称" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="basicForm.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="basicForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form
            ref="securityFormRef"
            :model="securityForm"
            :rules="securityRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="当前密码" prop="current_password">
              <el-input
                v-model="securityForm.current_password"
                type="password"
                placeholder="请输入当前密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="new_password">
              <el-input
                v-model="securityForm.new_password"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirm_password">
              <el-input
                v-model="securityForm.confirm_password"
                type="password"
                placeholder="请确认新密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="两步验证">
              <el-switch v-model="securityForm.two_factor_auth" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notification">
          <el-form
            ref="notificationFormRef"
            :model="notificationForm"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="系统通知">
              <el-switch v-model="notificationForm.system_notification" />
            </el-form-item>

            <el-form-item label="邮件通知">
              <el-switch v-model="notificationForm.email_notification" />
            </el-form-item>

            <el-form-item label="短信通知">
              <el-switch v-model="notificationForm.sms_notification" />
            </el-form-item>

            <el-form-item label="通知时间">
              <el-time-picker
                v-model="notificationForm.notification_time"
                format="HH:mm"
                placeholder="请选择通知时间"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="form-footer">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  updateUserNotification
} from '@/api/user'

const activeTab = ref('basic')
const saving = ref(false)
const basicFormRef = ref(null)
const securityFormRef = ref(null)
const notificationFormRef = ref(null)

// 基本信息表单
const basicForm = reactive({
  avatar: '',
  username: '',
  nickname: '',
  email: '',
  phone: ''
})

// 安全设置表单
const securityForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: '',
  two_factor_auth: false
})

// 通知设置表单
const notificationForm = reactive({
  system_notification: true,
  email_notification: true,
  sms_notification: false,
  notification_time: new Date(2000, 0, 1, 9, 0)
})

// 表单验证规则
const basicRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const securityRules = {
  current_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== securityForm.new_password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取用户信息
const fetchUserProfile = async () => {
  try {
    const res = await getUserProfile()
    const { basic, notification } = res.data
    Object.assign(basicForm, basic)
    Object.assign(notificationForm, notification)
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 头像上传成功
const handleAvatarSuccess = (res) => {
  basicForm.avatar = res.data.url
  ElMessage.success('头像上传成功')
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传头像图片只能是 JPG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 重置表单
const handleReset = () => {
  basicFormRef.value?.resetFields()
  securityFormRef.value?.resetFields()
  notificationFormRef.value?.resetFields()
}

// 保存设置
const handleSave = async () => {
  const forms = {
    basic: basicFormRef.value,
    security: securityFormRef.value,
    notification: notificationFormRef.value
  }
  
  const currentForm = forms[activeTab.value]
  if (!currentForm) return
  
  await currentForm.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        switch (activeTab.value) {
          case 'basic':
            await updateUserProfile(basicForm)
            break
          case 'security':
            await updateUserPassword(securityForm)
            break
          case 'notification':
            await updateUserNotification(notificationForm)
            break
        }
        ElMessage.success('保存成功')
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败: ' + error.message)
      } finally {
        saving.value = false
      }
    }
  })
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 20px;
  
  .card-header {
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
  }
  
  .profile-form {
    max-width: 600px;
    margin: 20px auto;
    
    .avatar-uploader {
      text-align: center;
      
      .avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        border: 1px dashed #d9d9d9;
        border-radius: 50%;
        cursor: pointer;
        transition: border-color 0.3s;
        
        &:hover {
          border-color: #409eff;
        }
      }
    }
  }
  
  .form-footer {
    margin-top: 20px;
    text-align: center;
  }
}
</style> 