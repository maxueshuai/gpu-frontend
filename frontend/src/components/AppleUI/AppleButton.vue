<template>
  <button
    class="apple-button"
    :class="[
      type ? `apple-button--${type}` : '',
      size ? `apple-button--${size}` : '',
      {
        'is-disabled': disabled,
        'is-loading': loading,
        'is-round': round,
        'is-plain': plain,
        'is-text': text,
        'is-circle': circle,
        'is-glass': glass
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <div class="apple-button-content">
      <span v-if="loading" class="loading-icon">
        <svg viewBox="0 0 50 50" class="circular">
          <circle class="path" cx="25" cy="25" r="20" fill="none" />
        </svg>
      </span>
      <i v-else-if="icon && !loading" :class="icon" class="button-icon"></i>
      <span v-if="$slots.default" class="button-text" :class="{ 'ml-2': icon && !loading && $slots.default }">
        <slot></slot>
      </span>
    </div>
    <span v-if="glass" class="glass-effect"></span>
  </button>
</template>

<script>
export default {
  name: 'AppleButton',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: (val) => {
        return ['default', 'primary', 'success', 'warning', 'danger', 'info', 'text'].includes(val)
      }
    },
    size: {
      type: String,
      default: '',
      validator: (val) => {
        return ['', 'large', 'medium', 'small', 'mini'].includes(val)
      }
    },
    icon: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    round: {
      type: Boolean,
      default: false
    },
    plain: {
      type: Boolean,
      default: false
    },
    text: {
      type: Boolean,
      default: false
    },
    circle: {
      type: Boolean,
      default: false
    },
    glass: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  methods: {
    handleClick(evt) {
      if (this.disabled || this.loading) return;
      this.$emit('click', evt)
    }
  }
}
</script>

<style>
.apple-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0);
  user-select: none;
  font-weight: 500;
  padding: 10px 18px;
  font-size: 14px;
  border-radius: 10px;
  color: #333;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.apple-button:active {
  transform: scale(0.97);
}

.apple-button.is-disabled,
.apple-button.is-loading {
  cursor: not-allowed;
  opacity: 0.6;
}

.apple-button.is-disabled:active,
.apple-button.is-loading:active {
  transform: none;
}

/* Button Content */
.apple-button-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* Button Types */
.apple-button--primary {
  color: #fff;
  background-color: #0071e3;
  border-color: #0071e3;
}

.apple-button--primary:hover,
.apple-button--primary:focus {
  background-color: #0077ed;
  border-color: #0077ed;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
  transform: translateY(-1px);
}

.apple-button--success {
  color: #fff;
  background-color: #34c759;
  border-color: #34c759;
}

.apple-button--success:hover,
.apple-button--success:focus {
  background-color: #39d463;
  border-color: #39d463;
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
  transform: translateY(-1px);
}

.apple-button--warning {
  color: #fff;
  background-color: #ff9500;
  border-color: #ff9500;
}

.apple-button--warning:hover,
.apple-button--warning:focus {
  background-color: #ffa01a;
  border-color: #ffa01a;
  box-shadow: 0 2px 8px rgba(255, 149, 0, 0.3);
  transform: translateY(-1px);
}

.apple-button--danger {
  color: #fff;
  background-color: #ff3b30;
  border-color: #ff3b30;
}

.apple-button--danger:hover,
.apple-button--danger:focus {
  background-color: #ff4d42;
  border-color: #ff4d42;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
  transform: translateY(-1px);
}

.apple-button--info {
  color: #fff;
  background-color: #5ac8fa;
  border-color: #5ac8fa;
}

.apple-button--info:hover,
.apple-button--info:focus {
  background-color: #67cefa;
  border-color: #67cefa;
  box-shadow: 0 2px 8px rgba(90, 200, 250, 0.3);
  transform: translateY(-1px);
}

/* Plain Button */
.apple-button.is-plain {
  background-color: transparent;
}

.apple-button--primary.is-plain {
  color: #0071e3;
}

.apple-button--primary.is-plain:hover,
.apple-button--primary.is-plain:focus {
  color: #fff;
  background-color: #0071e3;
}

.apple-button--success.is-plain {
  color: #34c759;
}

.apple-button--success.is-plain:hover,
.apple-button--success.is-plain:focus {
  color: #fff;
  background-color: #34c759;
}

.apple-button--warning.is-plain {
  color: #ff9500;
}

.apple-button--warning.is-plain:hover,
.apple-button--warning.is-plain:focus {
  color: #fff;
  background-color: #ff9500;
}

.apple-button--danger.is-plain {
  color: #ff3b30;
}

.apple-button--danger.is-plain:hover,
.apple-button--danger.is-plain:focus {
  color: #fff;
  background-color: #ff3b30;
}

.apple-button--info.is-plain {
  color: #5ac8fa;
}

.apple-button--info.is-plain:hover,
.apple-button--info.is-plain:focus {
  color: #fff;
  background-color: #5ac8fa;
}

/* Text Button */
.apple-button.is-text {
  background-color: transparent;
  border-color: transparent;
  padding: 8px 12px;
}

.apple-button--primary.is-text {
  color: #0071e3;
}

.apple-button--primary.is-text:hover,
.apple-button--primary.is-text:focus {
  color: #0077ed;
  background-color: rgba(0, 113, 227, 0.08);
}

.apple-button--success.is-text {
  color: #34c759;
}

.apple-button--success.is-text:hover,
.apple-button--success.is-text:focus {
  color: #39d463;
  background-color: rgba(52, 199, 89, 0.08);
}

.apple-button--warning.is-text {
  color: #ff9500;
}

.apple-button--warning.is-text:hover,
.apple-button--warning.is-text:focus {
  color: #ffa01a;
  background-color: rgba(255, 149, 0, 0.08);
}

.apple-button--danger.is-text {
  color: #ff3b30;
}

.apple-button--danger.is-text:hover,
.apple-button--danger.is-text:focus {
  color: #ff4d42;
  background-color: rgba(255, 59, 48, 0.08);
}

.apple-button--info.is-text {
  color: #5ac8fa;
}

.apple-button--info.is-text:hover,
.apple-button--info.is-text:focus {
  color: #67cefa;
  background-color: rgba(90, 200, 250, 0.08);
}

/* Round Button */
.apple-button.is-round {
  border-radius: 30px;
  padding-left: 22px;
  padding-right: 22px;
}

/* Circle Button */
.apple-button.is-circle {
  border-radius: 50%;
  padding: 10px;
  width: 40px;
  height: 40px;
}

.apple-button--large.is-circle {
  width: 48px;
  height: 48px;
}

.apple-button--small.is-circle {
  width: 32px;
  height: 32px;
}

.apple-button--mini.is-circle {
  width: 24px;
  height: 24px;
}

/* Button Sizes */
.apple-button--large {
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 12px;
}

.apple-button--small {
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 8px;
}

.apple-button--mini {
  padding: 6px 10px;
  font-size: 11px;
  border-radius: 6px;
}

/* Loading Animation */
.loading-icon {
  margin-right: 6px;
}

.circular {
  width: 16px;
  height: 16px;
  animation: rotate 2s linear infinite;
}

.apple-button--large .circular {
  width: 18px;
  height: 18px;
}

.apple-button--small .circular,
.apple-button--mini .circular {
  width: 14px;
  height: 14px;
}

.path {
  stroke-width: 2;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

.apple-button--primary .path,
.apple-button--success .path,
.apple-button--warning .path,
.apple-button--danger .path,
.apple-button--info .path {
  stroke: #fff;
}

.apple-button--default .path,
.apple-button.is-plain .path,
.apple-button.is-text .path {
  stroke: currentColor;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
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

/* Icon Style */
.button-icon {
  font-size: 16px;
}

.apple-button--large .button-icon {
  font-size: 18px;
}

.apple-button--small .button-icon,
.apple-button--mini .button-icon {
  font-size: 14px;
}

/* Space between icon and text */
.ml-2 {
  margin-left: 6px;
}

/* Glass Effect */
.apple-button.is-glass {
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.apple-button--primary.is-glass {
  background-color: rgba(0, 113, 227, 0.7);
  border-color: rgba(0, 113, 227, 0.3);
}

.apple-button--success.is-glass {
  background-color: rgba(52, 199, 89, 0.7);
  border-color: rgba(52, 199, 89, 0.3);
}

.apple-button--warning.is-glass {
  background-color: rgba(255, 149, 0, 0.7);
  border-color: rgba(255, 149, 0, 0.3);
}

.apple-button--danger.is-glass {
  background-color: rgba(255, 59, 48, 0.7);
  border-color: rgba(255, 59, 48, 0.3);
}

.apple-button--info.is-glass {
  background-color: rgba(90, 200, 250, 0.7);
  border-color: rgba(90, 200, 250, 0.3);
}

.glass-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 70%
  );
  background-size: 200% 100%;
  background-position: -100% 0;
  transition: background-position 0.5s;
}

.apple-button:hover .glass-effect {
  background-position: 100% 0;
}

@media (prefers-color-scheme: dark) {
  .apple-button {
    color: #f5f5f7;
    background-color: #323232;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .apple-button.is-glass {
    background-color: rgba(50, 50, 50, 0.6);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style> 