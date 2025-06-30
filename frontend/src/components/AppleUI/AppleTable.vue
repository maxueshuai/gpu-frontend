<template>
  <div class="apple-table-container">
    <div class="apple-table-header" v-if="showHeader">
      <slot name="header">
        <div class="apple-table-title">{{ title }}</div>
      </slot>
      <div class="apple-table-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="apple-table-wrapper" :class="{ 'is-loading': loading }">
      <div v-if="loading" class="apple-table-loading">
        <div class="apple-spinner"></div>
      </div>
      <table class="apple-table" :class="{ bordered, striped }">
        <thead>
          <tr>
            <th v-if="selectable" class="selection-column">
              <input
                type="checkbox"
                class="apple-checkbox"
                :checked="isAllSelected"
                @change="handleSelectAll"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.prop"
              :style="getColumnStyle(column)"
              @click="handleSort(column)"
              :class="{ 
                'sortable': column.sortable,
                'sorted-asc': sortBy === column.prop && sortOrder === 'asc',
                'sorted-desc': sortBy === column.prop && sortOrder === 'desc'
              }"
            >
              {{ column.label }}
              <span v-if="column.sortable" class="sort-icon"></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.length === 0 && !loading">
            <td :colspan="selectable ? columns.length + 1 : columns.length" class="empty-text">
              <slot name="empty">{{ emptyText }}</slot>
            </td>
          </tr>
          <tr
            v-for="(row, index) in data"
            :key="index"
            @click="handleRowClick(row, index)"
            :class="{ 'selected': isSelected(row) }"
          >
            <td v-if="selectable" class="selection-column">
              <input
                type="checkbox"
                class="apple-checkbox"
                :checked="isSelected(row)"
                @change="handleSelect(row)"
                @click.stop
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.prop"
              :style="getColumnStyle(column)"
            >
              <slot :name="column.prop" :row="row" :index="index">
                {{ getValueByPath(row, column.prop) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="apple-table-footer" v-if="pagination">
      <slot name="footer">
        <div class="apple-pagination">
          <button
            class="apple-pagination-btn"
            :disabled="currentPage <= 1"
            @click="handlePageChange(currentPage - 1)"
          >
            上一页
          </button>
          <div class="apple-pagination-info">
            {{ currentPage }} / {{ totalPages }} 页 (共 {{ total }} 条)
          </div>
          <button
            class="apple-pagination-btn"
            :disabled="currentPage >= totalPages"
            @click="handlePageChange(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppleTable',
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      default: () => []
    },
    selectable: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: true
    },
    striped: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Boolean,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    total: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      selectedRows: [],
      sortBy: '',
      sortOrder: ''
    }
  },
  computed: {
    isAllSelected() {
      return this.data.length > 0 && this.selectedRows.length === this.data.length
    },
    totalPages() {
      return this.pageSize > 0 ? Math.ceil(this.total / this.pageSize) : 0
    }
  },
  emits: ['select', 'select-all', 'row-click', 'sort-change', 'page-change'],
  methods: {
    handleSelectAll(event) {
      const checked = event.target.checked
      this.selectedRows = checked ? [...this.data] : []
      this.$emit('select-all', this.selectedRows)
    },
    handleSelect(row) {
      const index = this.selectedRows.findIndex(item => item === row)
      if (index === -1) {
        this.selectedRows.push(row)
      } else {
        this.selectedRows.splice(index, 1)
      }
      this.$emit('select', this.selectedRows)
    },
    isSelected(row) {
      return this.selectedRows.includes(row)
    },
    handleRowClick(row, index) {
      this.$emit('row-click', row, index)
    },
    handleSort(column) {
      if (!column.sortable) return
      
      if (this.sortBy === column.prop) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : (this.sortOrder === 'desc' ? '' : 'asc')
      } else {
        this.sortBy = column.prop
        this.sortOrder = 'asc'
      }
      
      this.$emit('sort-change', {
        prop: this.sortBy,
        order: this.sortOrder
      })
    },
    handlePageChange(page) {
      this.$emit('page-change', page)
    },
    getColumnStyle(column) {
      const style = {}
      if (column.width) {
        style.width = typeof column.width === 'number' ? `${column.width}px` : column.width
      }
      if (column.align) {
        style.textAlign = column.align
      }
      return style
    },
    getValueByPath(object, path) {
      if (!path) return ''
      const pathArray = path.split('.')
      let value = object
      
      for (let i = 0; i < pathArray.length; i++) {
        if (value == null) return ''
        value = value[pathArray[i]]
      }
      
      return value ?? ''
    }
  }
}
</script>

<style scoped>
.apple-table-container {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(209, 213, 219, 0.3);
}

.apple-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

.apple-table-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
}

.apple-table-wrapper {
  position: relative;
  overflow-x: auto;
}

.apple-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.apple-table th,
.apple-table td {
  padding: 12px 16px;
  color: #1d1d1f;
}

.apple-table th {
  font-weight: 500;
  background-color: rgba(240, 240, 245, 0.5);
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  position: sticky;
  top: 0;
  z-index: 1;
}

.apple-table.bordered th,
.apple-table.bordered td {
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.apple-table.striped tbody tr:nth-child(even) {
  background-color: rgba(240, 240, 245, 0.3);
}

.apple-table tbody tr:hover {
  background-color: rgba(0, 113, 227, 0.05);
}

.apple-table tbody tr.selected {
  background-color: rgba(0, 113, 227, 0.1);
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
}

.sort-icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-left: 5px;
  position: relative;
  vertical-align: middle;
}

.sort-icon::before,
.sort-icon::after {
  content: '';
  position: absolute;
  left: 50%;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
}

.sort-icon::before {
  top: 0;
  transform: translateX(-50%);
  border-bottom: 4px solid #c0c0c0;
}

.sort-icon::after {
  bottom: 0;
  transform: translateX(-50%);
  border-top: 4px solid #c0c0c0;
}

.sorted-asc .sort-icon::before {
  border-bottom-color: #0071e3;
}

.sorted-desc .sort-icon::after {
  border-top-color: #0071e3;
}

.apple-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid #d2d2d7;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  vertical-align: middle;
  position: relative;
}

.apple-checkbox:checked {
  background-color: #0071e3;
  border-color: #0071e3;
}

.apple-checkbox:checked::after {
  content: '';
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 5px;
  height: 9px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
}

.selection-column {
  width: 50px;
  text-align: center;
}

.empty-text {
  padding: 24px;
  text-align: center;
  color: #8e8e93;
}

.apple-table-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.apple-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 113, 227, 0.2);
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.apple-table-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
}

.apple-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.apple-pagination-btn {
  background-color: #f5f5f7;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s;
}

.apple-pagination-btn:hover:not(:disabled) {
  background-color: #e8e8ed;
}

.apple-pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apple-pagination-info {
  font-size: 14px;
  color: #6e6e73;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-color-scheme: dark) {
  .apple-table-container {
    background-color: rgba(30, 30, 30, 0.8);
    border-color: rgba(82, 82, 91, 0.3);
  }
  
  .apple-table-header {
    border-bottom-color: rgba(82, 82, 91, 0.3);
  }
  
  .apple-table-title {
    color: #f5f5f7;
  }
  
  .apple-table th,
  .apple-table td {
    color: #f5f5f7;
  }
  
  .apple-table th {
    background-color: rgba(28, 28, 30, 0.7);
    border-bottom-color: rgba(82, 82, 91, 0.3);
  }
  
  .apple-table.bordered th,
  .apple-table.bordered td {
    border-color: rgba(82, 82, 91, 0.3);
  }
  
  .apple-table.striped tbody tr:nth-child(even) {
    background-color: rgba(44, 44, 46, 0.5);
  }
  
  .apple-table tbody tr:hover {
    background-color: rgba(10, 132, 255, 0.1);
  }
  
  .apple-table tbody tr.selected {
    background-color: rgba(10, 132, 255, 0.2);
  }
  
  .apple-checkbox {
    border-color: #424245;
    background-color: #323234;
  }
  
  .empty-text {
    color: #8e8e93;
  }
  
  .apple-table-loading {
    background-color: rgba(28, 28, 30, 0.7);
  }
  
  .apple-table-footer {
    border-top-color: rgba(82, 82, 91, 0.3);
  }
  
  .apple-pagination-btn {
    background-color: #323234;
    border-color: #424245;
    color: #f5f5f7;
  }
  
  .apple-pagination-btn:hover:not(:disabled) {
    background-color: #3a3a3c;
  }
  
  .apple-pagination-info {
    color: #98989d;
  }
}
</style> 