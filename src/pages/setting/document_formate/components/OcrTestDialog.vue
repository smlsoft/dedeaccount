<template>
  <Dialog
    :visible="visible"
    modal
    header="ทดสอบ OCR Template"
    :style="{ width: '60vw' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="grid">
      <!-- ข้อมูล Template -->
      <div class="col-12 mb-3">
        <Card>
          <template #content>
            <div class="grid">
              <div class="col-6">
                <div class="text-500 text-sm mb-1">รหัสเทมเพลต</div>
                <div class="text-900 font-semibold">{{ templateData?.doccode }}</div>
              </div>
              <div class="col-6">
                <div class="text-500 text-sm mb-1">ชื่อเทมเพลต</div>
                <div class="text-900 font-semibold">{{ templateData?.description }}</div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Prompt Description -->
      <div class="col-12 mb-3">
        <div class="text-900 font-semibold mb-2">
          <i class="pi pi-file-edit mr-2"></i>
          Prompt Description
          <Tag value="แก้ไขได้" severity="info" class="ml-2" />
        </div>
        <Textarea
          v-model="localPromptDescription"
          rows="5"
          class="w-full"
          :maxlength="1000"
          placeholder="ระบุคำอธิบายเพิ่มเติมสำหรับ AI ในการวิเคราะห์เอกสาร (ไม่บังคับ)"
          :class="{ 'p-invalid': promptError }"
        />
        <div class="flex justify-content-between align-items-center mt-2">
          <small v-if="promptError" class="p-error">{{ promptError }}</small>
          <small v-else class="text-500">คำแนะนำ: ระบุรายละเอียดเกี่ยวกับประเภทเอกสาร, รูปแบบการบันทึก, หรือข้อมูลเฉพาะที่ต้องการให้ AI สังเกต</small>
          <small class="text-500 font-semibold">
            {{ localPromptDescription?.length || 0 }}/1000 ตัวอักษร
          </small>
        </div>
        <Message v-if="promptChanged" severity="warn" :closable="false" class="mt-2">
          <div class="flex align-items-center">
            <i class="pi pi-info-circle mr-2"></i>
            <span>คำอธิบายถูกแก้ไข - จะบันทึกอัตโนมัติเมื่อกดทดสอบ</span>
          </div>
        </Message>
      </div>

      <!-- ผังบัญชี (Details) -->
      <div class="col-12 mb-3" v-if="templateData?.details && templateData.details.length > 0">
        <Card>
          <template #title>
            <div class="flex align-items-center justify-content-between">
              <div>
                <i class="pi pi-list mr-2 text-primary"></i>
                <span>ผังบัญชีของเทมเพลต</span>
              </div>
              <Tag :value="`${templateData.details.length} รายการ`" severity="success" />
            </div>
          </template>
          <template #content>
            <DataTable
              :value="templateData.details"
              stripedRows
              showGridlines
              responsiveLayout="scroll"
              :scrollHeight="'250px'"
            >
              <Column field="actioncode" header="Action Code" style="min-width: 100px"></Column>
              <Column field="accountcode" header="รหัสบัญชี" style="min-width: 100px">
                <template #body="{ data }">
                  <span class="font-semibold text-primary">{{ data.accountcode }}</span>
                </template>
              </Column>
              <Column field="detail" header="ชื่อบัญชี" style="min-width: 200px"></Column>
              <Column field="debit" header="เดบิต" style="min-width: 100px" class="text-right">
                <template #body="{ data }">
                  <span v-if="data.debit > 0" class="text-green-600 font-semibold">
                    {{ formatCurrency(data.debit) }}
                  </span>
                  <span v-else class="text-400">-</span>
                </template>
              </Column>
              <Column field="credit" header="เครดิต" style="min-width: 100px" class="text-right">
                <template #body="{ data }">
                  <span v-if="data.credit > 0" class="text-orange-600 font-semibold">
                    {{ formatCurrency(data.credit) }}
                  </span>
                  <span v-else class="text-400">-</span>
                </template>
              </Column>
            </DataTable>
            <Divider />
            <div class="flex justify-content-end gap-4">
              <div class="text-right">
                <div class="text-500 text-sm">รวมเดบิต</div>
                <div class="text-green-600 font-bold text-xl">
                  {{ formatCurrency(totalDebit) }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-500 text-sm">รวมเครดิต</div>
                <div class="text-orange-600 font-bold text-xl">
                  {{ formatCurrency(totalCredit) }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-500 text-sm">สมดุล</div>
                <Tag
                  :value="isBalanced ? 'สมดุล' : 'ไม่สมดุล'"
                  :severity="isBalanced ? 'success' : 'danger'"
                  class="text-lg"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Upload Files -->
      <div class="col-12">
        <div class="text-900 font-semibold mb-2">
          <i class="pi pi-upload mr-2"></i>
          อัปโหลดรูปใบเสร็จ
        </div>
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
            <div class="flex align-items-center justify-content-center flex-column">
              <i class="pi pi-cloud-upload text-6xl text-400 mb-3"></i>
              <p class="text-500">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
              <small class="text-400">รองรับไฟล์: JPG, PNG (ขนาดไม่เกิน 10MB)</small>
            </div>
          </template>
          <template #content="{ files, removeFileCallback }">
            <div v-if="files.length > 0">
              <div class="grid">
                <div
                  v-for="(file, index) in files"
                  :key="index"
                  class="col-12 md:col-6 lg:col-4 mb-3"
                >
                  <Card>
                    <template #content>
                      <div class="relative">
                        <div class="cursor-pointer" @click="openPreview(file)">
                          <img
                            v-if="file.type.startsWith('image/')"
                            :src="file.objectURL"
                            :alt="file.name"
                            class="w-full border-round"
                            style="max-height: 200px; object-fit: cover;"
                          />
                          <div
                            v-else
                            class="flex align-items-center justify-content-center bg-gray-100 border-round"
                            style="height: 200px;"
                          >
                            <i class="pi pi-file-pdf text-6xl text-red-500"></i>
                          </div>
                          <div class="absolute bottom-0 left-0 right-0 bg-black-alpha-60 p-2 text-center text-white text-sm opacity-0 hover:opacity-100 transition-all transition-duration-200">
                            <i class="pi pi-eye mr-2"></i>
                            คลิกเพื่อดูขนาดเต็ม
                          </div>
                        </div>
                        <Button
                          icon="pi pi-times"
                          class="p-button-rounded p-button-danger p-button-text absolute"
                          style="top: -10px; right: -10px; z-index: 10;"
                          @click="removeFileCallback(index)"
                        />
                      </div>
                      <div class="text-sm text-500 mt-2 text-center">
                        {{ file.name }}
                      </div>
                      <div class="text-xs text-400 text-center">
                        {{ formatFileSize(file.size) }}
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
            </div>
          </template>
        </FileUpload>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-between align-items-center w-full">
        <Button
          label="ยกเลิก"
          icon="pi pi-times"
          class="p-button-text p-button-secondary"
          @click="closeDialog"
          :disabled="loading"
        />
        <Button
          label="ทดสอบ OCR"
          icon="pi pi-bolt"
          class="p-button-success"
          @click="testOcr"
          :loading="loading"
          :disabled="!selectedFiles || selectedFiles.length === 0"
        />
      </div>
    </template>
  </Dialog>

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
        :src="previewFile.objectURL"
        :alt="previewFile.name"
        class="w-full"
        style="max-height: 80vh; object-fit: contain;"
      />
      <!-- แสดง PDF -->
      <iframe
        v-else-if="previewFile.type === 'application/pdf'"
        :src="previewFile.objectURL"
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
  visible: {
    type: Boolean,
    default: false,
  },
  templateData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:visible', 'test-success', 'close']);

const fileUpload = ref(null);
const selectedFiles = ref([]);
const loading = ref(false);
const localPromptDescription = ref('');
const originalPromptDescription = ref('');
const promptError = ref('');
const previewDialog = ref(false);
const previewFile = ref(null);

// ตรวจสอบว่ามีการแก้ไข Prompt Description หรือไม่
const promptChanged = computed(() => {
  return localPromptDescription.value !== originalPromptDescription.value;
});

// คำนวณยอดรวม Debit
const totalDebit = computed(() => {
  if (!props.templateData?.details) return 0;
  return props.templateData.details.reduce((sum, item) => {
    return sum + parseFloat(item.debit || 0);
  }, 0);
});

// คำนวณยอดรวม Credit
const totalCredit = computed(() => {
  if (!props.templateData?.details) return 0;
  return props.templateData.details.reduce((sum, item) => {
    return sum + parseFloat(item.credit || 0);
  }, 0);
});

// ตรวจสอบว่าสมดุลหรือไม่
const isBalanced = computed(() => {
  return totalDebit.value === totalCredit.value;
});

// Watch เมื่อ Dialog เปิดขึ้น ให้โหลดค่า Prompt Description
watch(() => props.visible, (newVal) => {
  if (newVal && props.templateData) {
    localPromptDescription.value = props.templateData.promptdescription || '';
    originalPromptDescription.value = props.templateData.promptdescription || '';
    promptError.value = '';
  }
});

function onFileSelect(event) {
  selectedFiles.value = event.files;
}

function formatCurrency(value) {
  if (!value) return '0.00';
  return parseFloat(value).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function closeDialog() {
  selectedFiles.value = [];
  localPromptDescription.value = '';
  originalPromptDescription.value = '';
  promptError.value = '';
  if (fileUpload.value) {
    fileUpload.value.clear();
  }
  emit('close');
  emit('update:visible', false);
}

function validatePrompt() {
  if (localPromptDescription.value && localPromptDescription.value.length > 1000) {
    promptError.value = 'คำอธิบายต้องไม่เกิน 1000 ตัวอักษร';
    return false;
  }
  promptError.value = '';
  return true;
}

function openPreview(file) {
  previewFile.value = file;
  previewDialog.value = true;
}

function closePreview() {
  previewDialog.value = false;
  previewFile.value = null;
}

function testOcr() {
  if (!validatePrompt()) {
    return;
  }

  emit('test-success', {
    files: selectedFiles.value,
    templateGuidfixed: props.templateData?.guidfixed,
    promptDescription: localPromptDescription.value,
    promptChanged: promptChanged.value,
  });
}
</script>

<style scoped>
:deep(.p-fileupload-content) {
  padding: 1rem;
}

:deep(.p-fileupload) {
  border: 2px dashed #dee2e6;
  border-radius: 6px;
  background: #f8f9fa;
}
</style>
