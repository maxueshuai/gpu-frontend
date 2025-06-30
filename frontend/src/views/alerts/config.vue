<template>
  <div class="alert-config-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="left">
            <h3>告警配置</h3>
          </div>
          <div class="right">
            <el-button type="primary" @click="handleSave" :loading="saving">
              <el-icon><Save /></el-icon>保存配置
            </el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="config-form"
      >
        <el-form-item label="告警检查间隔" prop="check_interval">
          <el-input-number
            v-model="form.check_interval"
            :min="1"
            :max="60"
            :step="1"
            placeholder="请输入检查间隔"
          />
          <span class="unit">分钟</span>
        </el-form-item>

        <el-form-item label="告警恢复时间" prop="recovery_time">
          <el-input-number
            v-model="form.recovery_time"
            :min="1"
            :max="60"
            :step="1"
            placeholder="请输入恢复时间"
          />
          <span class="unit">分钟</span>
        </el-form-item>

        <el-form-item label="告警抑制时间" prop="suppression_time">
          <el-input-number
            v-model="form.suppression_time"
            :min="0"
            :max="1440"
            :step="5"
            placeholder="请输入抑制时间"
          />
          <span class="unit">分钟</span>
        </el-form-item>

        <el-form-item label="邮件通知配置">
          <el-form-item label="SMTP服务器" prop="smtp_host">
            <el-input v-model="form.smtp_host" placeholder="请输入SMTP服务器地址" />
          </el-form-item>
          <el-form-item label="SMTP端口" prop="smtp_port">
            <el-input-number
              v-model="form.smtp_port"
              :min="1"
              :max="65535"
              :step="1"
              placeholder="请输入SMTP端口"
            />
          </el-form-item>
          <el-form-item label="发件人邮箱" prop="smtp_user">
            <el-input v-model="form.smtp_user" placeholder="请输入发件人邮箱" />
          </el-form-item>
          <el-form-item label="邮箱密码" prop="smtp_password">
            <el-input
              v-model="form.smtp_password"
              type="password"
              placeholder="请输入邮箱密码"
              show-password
            />
          </el-form-item>
        </el-form-item>

        <el-form-item label="短信通知配置">
          <el-form-item label="短信服务商" prop="sms_provider">
            <el-select v-model="form.sms_provider" placeholder="请选择短信服务商">
              <el-option label="阿里云" value="aliyun" />
              <el-option label="腾讯云" value="tencent" />
            </el-select>
          </el-form-item>
          <el-form-item label="AccessKey" prop="sms_access_key">
            <el-input v-model="form.sms_access_key" placeholder="请输入AccessKey" />
          </el-form-item>
          <el-form-item label="AccessSecret" prop="sms_access_secret">
            <el-input
              v-model="form.sms_access_secret"
              type="password"
              placeholder="请输入AccessSecret"
              show-password
            />
          </el-form-item>
          <el-form-item label="短信签名" prop="sms_sign_name">
            <el-input v-model="form.sms_sign_name" placeholder="请输入短信签名" />
          </el-form-item>
          <el-form-item label="短信模板" prop="sms_template_code">
            <el-input v-model="form.sms_template_code" placeholder="请输入短信模板代码" />
          </el-form-item>
        </el-form-item>

        <el-form-item label="Webhook配置">
          <el-form-item label="Webhook地址" prop="webhook_url">
            <el-input v-model="form.webhook_url" placeholder="请输入Webhook地址" />
          </el-form-item>
          <el-form-item label="请求方法" prop="webhook_method">
            <el-select v-model="form.webhook_method" placeholder="请选择请求方法">
              <el-option label="POST" value="POST" />
              <el-option label="GET" value="GET" />
            </el-select>
          </el-form-item>
          <el-form-item label="请求头" prop="webhook_headers">
            <div
              v-for="(header, index) in form.webhook_headers"
              :key="index"
              class="header-item"
            >
              <el-input v-model="header.key" placeholder="键" class="header-key" />
              <el-input v-model="header.value" placeholder="值" class="header-value" />
              <el-button
                type="danger"
                link
                @click="removeHeader(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" link @click="addHeader">
              <el-icon><Plus /></el-icon>添加请求头
            </el-button>
          </el-form-item>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Save,
  Plus,
  Delete
} from '@element-plus/icons-vue'
import {
  getAlertConfig,
  updateAlertConfig
} from '@/api/alerts'

const formRef = ref(null)
const saving = ref(false)

// 表单数据
const form = reactive({
  check_interval: 5,
  recovery_time: 5,
  suppression_time: 30,
  smtp_host: '',
  smtp_port: 465,
  smtp_user: '',
  smtp_password: '',
  sms_provider: '',
  sms_access_key: '',
  sms_access_secret: '',
  sms_sign_name: '',
  sms_template_code: '',
  webhook_url: '',
  webhook_method: 'POST',
  webhook_headers: []
})

// 表单验证规则
const rules = {
  check_interval: [
    { required: true, message: '请输入告警检查间隔', trigger: 'blur' }
  ],
  recovery_time: [
    { required: true, message: '请输入告警恢复时间', trigger: 'blur' }
  ],
  smtp_host: [
    { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
  ],
  smtp_port: [
    { required: true, message: '请输入SMTP端口', trigger: 'blur' }
  ],
  smtp_user: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' }
  ],
  smtp_password: [
    { required: true, message: '请输入邮箱密码', trigger: 'blur' }
  ],
  sms_provider: [
    { required: true, message: '请选择短信服务商', trigger: 'change' }
  ],
  sms_access_key: [
    { required: true, message: '请输入AccessKey', trigger: 'blur' }
  ],
  sms_access_secret: [
    { required: true, message: '请输入AccessSecret', trigger: 'blur' }
  ],
  sms_sign_name: [
    { required: true, message: '请输入短信签名', trigger: 'blur' }
  ],
  sms_template_code: [
    { required: true, message: '请输入短信模板代码', trigger: 'blur' }
  ],
  webhook_url: [
    { required: true, message: '请输入Webhook地址', trigger: 'blur' }
  ],
  webhook_method: [
    { required: true, message: '请选择请求方法', trigger: 'change' }
  ]
}

// 获取配置
const fetchConfig = async () => {
  try {
    const res = await getAlertConfig()
    Object.assign(form, res.data)
  } catch (error) {
    console.error('获取告警配置失败:', error)
    ElMessage.error('获取告警配置失败')
  }
}

// 添加请求头
const addHeader = () => {
  form.webhook_headers.push({ key: '', value: '' })
}

// 删除请求头
const removeHeader = (index) => {
  form.webhook_headers.splice(index, 1)
}

// 保存配置
const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        await updateAlertConfig(form)
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
  fetchConfig()
})
</script>

<style lang="scss" scoped>
.alert-config-container {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .left {
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
    }
  }
  
  .config-form {
    max-width: 800px;
    margin: 0 auto;
    
    .unit {
      margin-left: 10px;
      color: #909399;
    }
    
    .header-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      
      .header-key {
        width: 200px;
      }
      
      .header-value {
        flex: 1;
      }
    }
  }
}
</style> 