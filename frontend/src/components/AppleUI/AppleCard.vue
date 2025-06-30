<template>
  <div 
    class="apple-card" 
    :class="{ 
      shadow, 
      hover, 
      [`apple-card--${type}`]: type,
      [`apple-card--${size}`]: size
    }"
  >
    <div v-if="$slots.header || title" class="apple-card-header">
      <slot name="header">
        <div class="apple-card-title">
          <span v-if="icon" class="apple-card-icon">
            <i :class="icon"></i>
          </span>
          {{ title }}
        </div>
      </slot>
      <div v-if="$slots.extra" class="apple-card-extra">
        <slot name="extra"></slot>
      </div>
    </div>
    <div class="apple-card-body" :style="bodyStyle">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="apple-card-footer">
      <slot name="footer"></slot>
    </div>
    <div v-if="loading" class="apple-card-loading-mask">
      <div class="apple-card-loading-spinner">
        <svg viewBox="0 0 50 50" class="circular">
          <circle class="path" cx="25" cy="25" r="20" fill="none" />
        </svg>
        <div v-if="loadingText" class="loading-text">{{ loadingText }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppleCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    shadow: {
      type: Boolean,
      default: true
    },
    hover: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: ''
    },
    bodyStyle: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: '',
      validator: (val) => ['', 'primary', 'success', 'warning', 'danger', 'info'].includes(val)
    },
    size: {
      type: String,
      default: '',
      validator: (val) => ['', 'large', 'small'].includes(val)
    }
  }
}
</script>

<style scoped>
.apple-card {
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(209, 213, 219, 0.3);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0);
  margin-bottom: 20px;
  position: relative;
}

.apple-card.shadow {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.apple-card.hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.apple-card-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(248, 248, 250, 0.5);
}

.apple-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  letter-spacing: -0.2px;
}

.apple-card-icon {
  margin-right: 8px;
  color: #0071e3;
  display: flex;
  align-items: center;
}

.apple-card-extra {
  display: flex;
  align-items: center;
}

.apple-card-body {
  padding: 20px;
  color: #1d1d1f;
}

.apple-card-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  background-color: rgba(248, 248, 250, 0.5);
}

/* Card Types */
.apple-card--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #0071e3;
}

.apple-card--success::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #34c759;
}

.apple-card--warning::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #ff9500;
}

.apple-card--danger::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #ff3b30;
}

.apple-card--info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #5ac8fa;
}

/* Card Sizes */
.apple-card--large .apple-card-header {
  padding: 20px 24px;
}

.apple-card--large .apple-card-title {
  font-size: 18px;
}

.apple-card--large .apple-card-body {
  padding: 24px;
}

.apple-card--large .apple-card-footer {
  padding: 18px 24px;
}

.apple-card--small .apple-card-header {
  padding: 12px 16px;
}

.apple-card--small .apple-card-title {
  font-size: 14px;
}

.apple-card--small .apple-card-body {
  padding: 16px;
}

.apple-card--small .apple-card-footer {
  padding: 12px 16px;
}

/* Loading */
.apple-card-loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 16px;
  animation: fadeIn 0.3s;
}

.apple-card-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.circular {
  width: 40px;
  height: 40px;
  animation: rotate 2s linear infinite;
}

.path {
  stroke: #0071e3;
  stroke-width: 2;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

.loading-text {
  margin-top: 12px;
  color: #86868b;
  font-size: 14px;
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-color-scheme: dark) {
  .apple-card {
    background-color: rgba(30, 30, 30, 0.8);
    border-color: rgba(82, 82, 91, 0.3);
  }
  
  .apple-card-header {
    border-bottom-color: rgba(82, 82, 91, 0.3);
    background-color: rgba(35, 35, 35, 0.5);
  }
  
  .apple-card-title {
    color: #f5f5f7;
  }
  
  .apple-card-body {
    color: #f5f5f7;
  }
  
  .apple-card-footer {
    border-top-color: rgba(82, 82, 91, 0.3);
    background-color: rgba(35, 35, 35, 0.5);
  }
  
  .apple-card-loading-mask {
    background-color: rgba(30, 30, 30, 0.8);
  }
}
</style> 