<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  selectedModel: {
    type: String,
    default: "mistral",
  },
});

const emit = defineEmits([
  "update:visible",
  "update:selectedModel",
  "confirm",
  "cancel",
]);

function handleConfirm() {
  emit("confirm");
}

function handleCancel() {
  emit("cancel");
  emit("update:visible", false);
}

function updateModel(value) {
  emit("update:selectedModel", value);
}
</script>

<template>
  <Dialog
    :visible="visible"
    :modal="true"
    :closable="false"
    :draggable="false"
    :style="{ width: '560px' }"
    class="ocr-model-dialog"
  >
    <template #header>
      <div class="flex align-items-center gap-3">
        <i class="pi pi-sparkles text-primary" style="font-size: 1.5rem"></i>
        <div>
          <h3 class="m-0 text-900">เลือก AI Model</h3>
          <p class="m-0 mt-1 text-600 text-sm">
            เลือกโมเดล AI ที่ต้องการใช้วิเคราะห์เอกสาร
          </p>
        </div>
      </div>
    </template>

    <div class="model-selection-content">
      <div class="flex flex-column gap-3">
        <!-- Mistral Option -->
        <div
          class="model-card"
          :class="{ 'model-card-selected': selectedModel === 'mistral' }"
          @click="updateModel('mistral')"
        >
          <div class="model-card-header">
            <div class="flex align-items-center gap-3 flex-1">
              <div class="model-icon mistral-icon">
                <i class="pi pi-star"></i>
              </div>
              <div class="flex-1">
                <div class="flex align-items-center gap-2 mb-1">
                  <span class="model-name">Mistral AI</span>
                  <span class="badge-recommended">แนะนำ</span>
                </div>
                <p class="model-description">
                  โมเดลประหยัด เหมาะสำหรับเอกสารทั่วไป ใช้งานประจำวัน
                </p>
              </div>
              <RadioButton
                inputId="mistral"
                name="model"
                value="mistral"
                :modelValue="selectedModel"
                @update:modelValue="updateModel"
              />
            </div>
          </div>
        </div>

        <!-- Gemini Option -->
        <div
          class="model-card"
          :class="{ 'model-card-selected': selectedModel === 'gemini' }"
          @click="updateModel('gemini')"
        >
          <div class="model-card-header">
            <div class="flex align-items-center gap-3 flex-1">
              <div class="model-icon gemini-icon">
                <i class="pi pi-google"></i>
              </div>
              <div class="flex-1">
                <div class="flex align-items-center gap-2 mb-1">
                  <span class="model-name">Google Gemini</span>
                  <!-- <span class="badge-premium">Pro</span> -->
                </div>
                <p class="model-description">
                  โมเดลที่แม่นยำกว่า เมื่อต้องการความละเอียดสูง
                </p>
              </div>
              <RadioButton
                inputId="gemini"
                name="model"
                value="gemini"
                :modelValue="selectedModel"
                @update:modelValue="updateModel"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button
          label="ยกเลิก"
          icon="pi pi-times"
          @click="handleCancel"
          severity="secondary"
          text
        />
        <Button
          label="ยืนยันและดำเนินการต่อ"
          icon="pi pi-check"
          @click="handleConfirm"
          severity="primary"
          autofocus
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.model-selection-content {
  padding: 0.5rem 0;
}

.model-card {
  background: var(--surface-card);
  border: 2px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.model-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-600) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.model-card:hover {
  border-color: var(--primary-400);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.model-card-selected {
  border-color: var(--primary-color);
  background: var(--primary-50);
  box-shadow: 0 4px 16px rgba(var(--primary-500), 0.2);
}

.model-card-selected::before {
  opacity: 0.03;
}

.model-card-header {
  margin-bottom: 0.75rem;
}

.model-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.model-card:hover .model-icon {
  transform: scale(1.1);
}

.gemini-icon {
  background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
  color: white;
}

.mistral-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.model-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.model-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

.badge-recommended {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.badge-premium {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

/* Dialog Header Styling */
:deep(.p-dialog-header) {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-dialog-content) {
  padding: 1.5rem;
}

:deep(.p-dialog-footer) {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--surface-border);
}

/* Animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.model-card {
  animation: slideIn 0.3s ease-out;
}

.model-card:nth-child(2) {
  animation-delay: 0.1s;
}
</style>
