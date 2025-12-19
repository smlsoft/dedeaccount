<template>
  <div class="surface-card p-3 h-full overflow-auto">
    <div v-if="!templateData || !templateData.guidfixed" class="flex align-items-center justify-content-center h-full">
      <div class="text-center text-500">
        <i class="pi pi-info-circle text-6xl mb-3"></i>
        <p>เลือก Template และบันทึกข้อมูลก่อน<br/>เพื่อทดสอบ OCR</p>
      </div>
    </div>

    <div v-else>
      <!-- Upload Area -->
      <Card class="mb-3">
        <template #title>
          <div class="flex align-items-center justify-content-between">
            <span><i class="pi pi-upload mr-2"></i>อัปโหลดรูปใบเสร็จ</span>
            <Tag v-if="uploadedFiles.length > 0" :value="`${uploadedFiles.length} ไฟล์`" severity="success" />
          </div>
        </template>
        <template #content>
          <FileUpload
            ref="fileUpload"
            name="files[]"
            :multiple="true"
            accept="image/*,.pdf"
            :maxFileSize="10000000"
            @select="onFileSelect"
            :auto="false"
            :showUploadButton="false"
            :showCancelButton="false"
            :customUpload="true"
          >
            <template #empty>
              <div class="text-center p-3">
                <i class="pi pi-cloud-upload text-4xl text-400 mb-2"></i>
                <p class="text-500 text-sm">คลิกหรือลากไฟล์มาวางที่นี่</p>
                <small class="text-400">JPG, PNG , PDF (สูงสุด 10MB)</small>
              </div>
            </template>
            <template #content="{ files, removeFileCallback }">
              <div v-if="files.length > 0" class="mt-2">
                <div v-for="(file, index) in files" :key="index" class="mb-2">
                  <div class="flex align-items-center p-2 surface-100 border-round">
                    <div class="cursor-pointer" @click="openPreview(file)" style="position: relative;">
                      <img
                        v-if="file.type.startsWith('image/')"
                        :src="file.objectURL"
                        :alt="file.name"
                        class="border-round hover:opacity-80 transition-all transition-duration-200"
                        style="width: 50px; height: 50px; object-fit: cover;"
                      />
                      <i v-else class="pi pi-file-pdf text-red-500 text-3xl hover:text-red-600 transition-all transition-duration-200"></i>
                      <div class="absolute" style="top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0; pointer-events: none;" :class="{'hover-icon': true}">
                        <i class="pi pi-eye text-white text-xl"></i>
                      </div>
                    </div>
                    <div class="flex-1 ml-3">
                      <div class="text-sm font-semibold">{{ file.name }}</div>
                      <small class="text-500">{{ formatFileSize(file.size) }}</small>
                    </div>
                    <Button
                      icon="pi pi-times"
                      class="p-button-rounded p-button-danger p-button-text"
                      @click="removeFileCallback(index)"
                    />
                  </div>
                </div>
              </div>
            </template>
          </FileUpload>

          <Button
            label="ทดสอบ OCR"
            icon="pi pi-bolt"
            class="w-full mt-3 p-button-success"
            @click="testOcr"
            :loading="loading"
            :disabled="uploadedFiles.length === 0"
          />
        </template>
      </Card>

      <!-- OCR Result Summary -->
      <Card v-if="ocrResult">
        <template #title>
          <div class="flex align-items-center justify-content-between">
            <span><i class="pi pi-check-circle mr-2"></i>ผลลัพธ์ OCR</span>
            <Tag
              :value="ocrResult.accounting_entry?.balance_check?.balanced ? 'สมดุล' : 'ไม่สมดุล'"
              :severity="ocrResult.accounting_entry?.balance_check?.balanced ? 'success' : 'danger'"
            />
          </div>
        </template>
        <template #content>
          <!-- สถานะ -->
          <div class="grid mb-3">
            <div class="col-6">
              <div class="text-500 text-xs">ความเชื่อมั่น</div>
              <div class="text-900 font-bold">{{ ocrResult.validation?.confidence?.score }}%</div>
            </div>
            <div class="col-6">
              <div class="text-500 text-xs">ต้องตรวจสอบ</div>
              <Tag
                :value="ocrResult.validation?.requires_review ? 'ใช่' : 'ไม่'"
                :severity="ocrResult.validation?.requires_review ? 'warning' : 'success'"
              />
            </div>
          </div>

          <!-- รายการบัญชี (แบบย่อ) -->
          <Divider />
          <div class="text-500 text-sm mb-2">รายการบัญชีที่ตรวจพบ</div>
          <DataTable
            :value="ocrResult.accounting_entry?.entries"
            class="text-sm"
          >
            <Column field="account_code" header="รหัส" style="min-width: 80px">
              <template #body="{ data }">
                <span class="font-semibold text-primary">{{ data.account_code }}</span>
              </template>
            </Column>
            <Column field="account_name" header="ชื่อบัญชี" style="min-width: 150px">
              <template #footer>
                <span class="font-bold">รวม</span>
              </template>
            </Column>
            <Column field="debit" header="เดบิต" style="min-width: 80px" class="text-right">
              <template #body="{ data }">
                <span v-if="data.debit > 0" class="text-green-600 font-semibold">
                  {{ data.debit.toLocaleString() }}
                </span>
                <span v-else class="text-400">-</span>
              </template>
              <template #footer>
                <span class="text-green-600 font-bold text-lg">
                  {{ ocrResult.accounting_entry?.balance_check?.total_debit?.toLocaleString() || '0' }}
                </span>
              </template>
            </Column>
            <Column field="credit" header="เครดิต" style="min-width: 80px" class="text-right">
              <template #body="{ data }">
                <span v-if="data.credit > 0" class="text-orange-600 font-semibold">
                  {{ data.credit.toLocaleString() }}
                </span>
                <span v-else class="text-400">-</span>
              </template>
              <template #footer>
                <span class="text-orange-600 font-bold text-lg">
                  {{ ocrResult.accounting_entry?.balance_check?.total_credit?.toLocaleString() || '0' }}
                </span>
              </template>
            </Column>
          </DataTable>

          <!-- ปุ่มดูรายละเอียด -->
          <Button
            label="ดูรายละเอียดเต็ม"
            icon="pi pi-external-link"
            class="w-full mt-3 p-button-outlined"
            @click="$emit('view-detail')"
          />
        </template>
      </Card>
    </div>
  </div>

  <!-- Preview Dialog -->
  <Dialog
    v-model:visible="previewDialog"
    modal
    :header="previewFile?.name || 'ดูไฟล์'"
    :style="{ width: '90vw' }"
    :breakpoints="{ '1199px': '95vw' }"
    :maximizable="true"
    @hide="closePreview"
  >
    <div v-if="previewFile" class="flex align-items-center justify-content-center" style="min-height: 70vh;">
      <!-- แสดงรูปภาพ -->
      <img
        v-if="previewFile.type.startsWith('image/')"
        :src="previewFileUrl"
        :alt="previewFile.name"
        class="w-full"
        style="max-height: 80vh; object-fit: contain;"
      />
      <!-- แสดง PDF -->
      <iframe
        v-else-if="previewFile.type === 'application/pdf'"
        :src="previewFileUrl"
        class="w-full border-none"
        style="height: 80vh;"
      ></iframe>
      <div v-else class="text-center">
        <i class="pi pi-file text-6xl text-gray-400 mb-3"></i>
        <p class="text-500">ไม่สามารถแสดงตัวอย่างไฟล์ประเภทนี้ได้</p>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-content-between align-items-center w-full">
        <div class="text-sm text-500">
          <i class="pi pi-info-circle mr-2"></i>
          {{ previewFile?.name }} ({{ formatFileSize(previewFile?.size) }})
        </div>
        <Button
          label="ปิด"
          icon="pi pi-times"
          class="p-button-text"
          @click="closePreview"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  templateData: {
    type: Object,
    default: null,
  },
  ocrResult: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['test-ocr', 'view-detail']);

const fileUpload = ref(null);
const uploadedFiles = ref([]);
const previewDialog = ref(false);
const previewFile = ref(null);
const previewUrl = ref(null);

// สร้าง URL สำหรับ preview
const previewFileUrl = computed(() => {
  if (!previewFile.value) return null;
  
  // ถ้ามี objectURL อยู่แล้ว (สำหรับรูปภาพ) ใช้เลย
  if (previewFile.value.objectURL) {
    return previewFile.value.objectURL;
  }
  
  // ถ้าไม่มี objectURL (กรณี PDF บางกรณี) สร้างใหม่
  if (previewUrl.value) {
    return previewUrl.value;
  }
  
  return null;
});

// ทำความสะอาด URL เมื่อเปลี่ยนไฟล์
watch(previewFile, (newFile, oldFile) => {
  // ลบ URL เก่าถ้ามี
  if (previewUrl.value && oldFile) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
  
  // สร้าง URL ใหม่ถ้าเป็น PDF และไม่มี objectURL
  if (newFile && !newFile.objectURL && newFile.type === 'application/pdf') {
    previewUrl.value = URL.createObjectURL(newFile);
  }
});

function onFileSelect(event) {
  uploadedFiles.value = event.files;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function testOcr() {
  emit('test-ocr', uploadedFiles.value);
}

function openPreview(file) {
  previewFile.value = file;
  previewDialog.value = true;
}

function closePreview() {
  // ทำความสะอาด URL ที่สร้างไว้
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
  
  previewDialog.value = false;
  previewFile.value = null;
}

function clearFiles() {
  uploadedFiles.value = [];
  if (fileUpload.value) {
    fileUpload.value.clear();
  }
}

defineExpose({
  clearFiles,
});
</script>

<style scoped>
:deep(.p-fileupload) {
  border: 2px dashed #dee2e6;
  border-radius: 6px;
}

:deep(.p-fileupload-content) {
  padding: 0.5rem;
}
</style>
