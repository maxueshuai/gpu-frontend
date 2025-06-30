<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 50]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      :background="true"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:page', 'update:limit', 'pagination'])

const currentPage = ref(props.page)
const pageSize = ref(props.limit)

watch(() => props.page, (val) => {
  currentPage.value = val
})

watch(() => props.limit, (val) => {
  pageSize.value = val
})

const handleSizeChange = (val) => {
  emit('update:limit', val)
  emit('pagination', { page: currentPage.value, limit: val })
}

const handleCurrentChange = (val) => {
  emit('update:page', val)
  emit('pagination', { page: val, limit: pageSize.value })
}
</script>

<style lang="scss" scoped>
.pagination-container {
  padding: 20px 0;
  text-align: right;
}
</style> 