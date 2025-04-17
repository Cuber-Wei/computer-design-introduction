<template>
  <div class="container">
    <a-upload-dragger v-model:fileList="fileList" name="dataFile" :multiple="false" :before-upload="beforeUpload"
      accept=".csv,.xlsx">
      <p class="ant-upload-text">上传数据集文件</p>
      <p class="ant-upload-hint">支持CSV/Excel格式文件</p>
    </a-upload-dragger>

    <div class="control-panel" v-if="parsedData.length > 0">
      <span>统计项目</span>
      <a-select v-model:value="selectedColumn" placeholder="选择要分析的列" style="width: 200px">
        <a-select-option v-for="(col, index) in numericColumns" :key="index" :value="col">
          {{ col }}
        </a-select-option>
      </a-select>

    </div>

    <a-tabs v-if="parsedData.length > 0" class="data-tabs">
      <a-tab-pane key="raw" tab="原始数据">
        <a-table :columns="tableColumns" :data-source="parsedData" :pagination="{ pageSize: 10 }" bordered />
      </a-tab-pane>
      <a-tab-pane key="stats" tab="统计分析">
        <div v-if="buckets.length > 0" class="bucket-list">
          <a-list item-layout="horizontal">
            <a-list-item v-for="(bucket, index) in buckets.slice(0, 10)" :key="index">
              <a-list-item-meta>
                <template #title>
                  {{ bucket.range }} ({{ bucket.count }}条)
                </template>
                <template #description>
                  <a-progress :percent="(bucket.count / maxCount) * 100" status="active" :show-info="false" />
                </template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </div>
      </a-tab-pane>
      <a-tab-pane key="top10" tab="Top 10 数据">
        <a-table :columns="top10Columns" :data-source="sortedData"
          :pagination="{ pageSize: 10, hideOnSinglePage: true }" bordered />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { read, utils } from 'xlsx';

const fileList = ref([]);
const parsedData = ref([]);
const columns = ref([]);
const numericColumns = ref([]);
const selectedColumn = ref('');

const beforeUpload = async (file: File) => {
  try {
    const rawData = await readFile(file);
    const rawDataStr = typeof rawData === 'string' ? rawData : new TextDecoder().decode(rawData as ArrayBuffer);
    const { data, headers } = parseFileData(rawDataStr, file.type);
    parsedData.value = data as never[];
    columns.value = headers as never[];
    // 过滤有效数值列
    const isNumericColumn = (colIndex: number) => {
      return parsedData.value.every(row => {
        const val = row[headers[colIndex] as string] as string | number;
        const numVal = Number(val);
        return !isNaN(numVal) && isFinite(numVal) &&
          /^[-+]?\d*\.?\d+([eE][-+]?\d+)?$/.test(val?.toString().trim());
      });
    };
    numericColumns.value = headers
      .map((_, index) => index)
      .filter(index => isNumericColumn(index))
      .map(index => headers[index]) as never[];

    selectedColumn.value = numericColumns.value.length > 0 ? numericColumns.value[0] : '';
    if (!numericColumns.value.includes(selectedColumn.value as never)) {
      selectedColumn.value = '';
    }
    return false;
  } catch (error) {
    message.error('文件解析失败: ' + (error as Error).message);
    return false;
  }
};

const readFile = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const target = e.target;
      if (target && target.result) {
        resolve(target.result);
      } else {
        reject(new Error('读取文件时未获取到有效的结果'));
      }
    };
    reader.onerror = (error) => reject(error);

    if (file.type.includes('sheet')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
};

const parseFileData = (rawData: string, fileType: string) => {
  let data, headers;

  // 统一使用header: 1处理所有文件类型
  const workbook = read(rawData, fileType.includes('sheet') ? { type: 'array' } : { type: 'string' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // 转换时保留空行用于调试
  const worksheetData = utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: true,
    defval: null
  });

  headers = worksheetData.length > 0
    ? ((worksheetData[0] as unknown[] | undefined)?.filter((h: unknown) => h !== null && h !== undefined) ?? [])
    : [];

  // 过滤空行并转换数据结构
  data = worksheetData
    .slice(1)
    .filter((row: unknown): boolean => Array.isArray(row) && row.some(cell => cell !== null))
    .map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        const typedObj: Record<string, unknown> = obj as Record<string, unknown>;
        typedObj[header as string] = (row as unknown[])[index] ?? null;
      });
      return obj;
    });

  if (headers.length === 0) {
    throw new Error('文件缺少有效表头');
  }

  return { data, headers };
};

const buckets = computed(() => {
  if (!selectedColumn.value) return [];

  const values = parsedData.value
    .map(item => parseFloat(item[selectedColumn.value]))
    .filter(val => !isNaN(val))
    .sort((a, b) => a - b);

  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const interval = (max - min) / 10;
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${(min + i * interval).toFixed(2)} - ${(min + (i + 1) * interval).toFixed(2)}`,
    count: 0
  }));

  values.forEach(value => {
    const rawIndex = Math.floor((value - min) / interval);
    const index = Math.min(rawIndex, buckets.length - 1);
    buckets[index].count++;
  });

  return buckets;
});

const maxCount = computed(() => {
  return buckets.value.length > 0
    ? Math.max(...buckets.value.map(b => b.count))
    : 0;
});

const tableColumns = computed(() => {
  return columns.value.map(col => ({
    title: col,
    dataIndex: col,
    key: col,
    ellipsis: true,
    sorter: (a: Record<string, unknown>, b: Record<string, unknown>) => {
      const valA = a[col];
      const valB = b[col];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return valA - valB;
      }
      return String(valA).localeCompare(String(valB));
    },
    sortDirections: ['ascend', 'descend']
  }));
});

const sortedData = computed(() => {
  if (!selectedColumn.value) return parsedData.value;

  const numericColumns = ref<string[]>([]);
  const isNumeric = numericColumns.value.includes(selectedColumn.value);

  return [...parsedData.value].sort((a, b) => {
    let valA = a[selectedColumn.value];
    let valB = b[selectedColumn.value];

    // 处理空值
    valA = valA ?? (isNumeric ? -Infinity : '');
    valB = valB ?? (isNumeric ? -Infinity : '');

    if (typeof valA === 'number' && typeof valB === 'number') {
      return valB - valA;
    }
    return String(valB).localeCompare(String(valA));
  });
});
const top10Columns = computed(() => {
  return columns.value.map(col => ({
    title: col,
    dataIndex: col,
    key: col,
    ellipsis: true
  }));
});
</script>

<style scoped>
.container {
  padding: 20px;
  width: clamp(300px, 80%, 1500px);
  margin: 0 auto;
}

/* 新增表格样式 */
:deep(.ant-table-cell) {
  padding: 8px 12px !important;
  line-height: 1.4;
  max-width: 400px;
  height: clamp(24px, 2.5vw, 96px);
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.ant-table-thead th) {
  white-space: nowrap;
}

:deep(.ant-table-tbody td) {
  word-break: break-word;
}

.control-panel {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

.data-tabs {
  margin-top: 20px;
}

.bucket-list {
  margin-top: 15px;
}
</style>