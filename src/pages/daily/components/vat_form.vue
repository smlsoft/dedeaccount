<script setup>
import { ref, onMounted, computed, watch } from "vue";
import Utils from "@/utils/";
import DialogForm from "@/components/DialogForm.vue";
const deleteDetailVatDialog = ref(false);
const isUpdate = ref(false);
const vatvalue = ref("");

const textContent = ref("ต้องการลบข้อมูลภาษี ");

const del_data = ref({ data: null, index: 0 });
const sum_vatbase = computed({
  get() {
    var sumvalue = 0;
    props.vats.forEach((ele) => {
      sumvalue += parseFloat(ele.vatbase);
    });
    return sumvalue.toFixed(2);
  },
});
const sum_vatamount = computed({
  get() {
    var sumvalue = 0;
    props.vats.forEach((ele) => {
      sumvalue += parseFloat(ele.vatamount);
    });
    return sumvalue.toFixed(2);
  },
});
const sum_vat_exemption = computed({
  get() {
    var sumvalue = 0;
    props.vats.forEach((ele) => {
      sumvalue += parseFloat(ele.exceptvat);
    });
    return sumvalue.toFixed(2);
  },
});
const emit = defineEmits([
  "addBoxVat",
  "deleteDetailVat",
  "calVatAmount",
  "checkDateFormat",
  "setBranch",
]);

const props = defineProps({
  vats: Object,
  vats_valid: Object,
  isUpdate: Boolean,
  id: String,
});

onMounted(async () => {});
vatvalue.value = del_data.index + 1;

function deleteDetailVat() {
  emit("deleteDetailVat", del_data.value.index);
  deleteDetailVatDialog.value = false;
}

function addBoxVat() {
  emit("addBoxVat");
}

function removeBoxVat(data, index) {
  deleteDetailVatDialog.value = true;
  del_data.value = { data: data, index: index };
}

function setBranch(index) {
  emit("setBranch");
}

function calVatAmount(index) {
  emit("calVatAmount", index);
}

function checkDateFormat(index) {
  emit("checkDateFormat", index);
}
</script>

<template>
  <div
    class="flex justify-content-between flex-wrap m-0 mb-3 p-0 text-900 line-height-3"
  >
    <div class="flex align-items-center justify-content-center">
      รวมฐานภาษี : {{ Utils.formatCurrency(sum_vatbase) }} บาท |
      รวมยอดยกเว้นภาษี : {{ Utils.formatCurrency(sum_vat_exemption) }} บาท
    </div>
    <div class="flex align-items-center justify-content-center font-bold">
      รวมยอดภาษี : {{ Utils.formatCurrency(sum_vatamount) }} บาท
    </div>
  </div>
  <div
    class="surface-card p-4 shadow-2 mb-3 border-round"
    v-for="(data, index) in props.vats"
    :key="index"
  >
    <div class="mb-0 flex align-items-center justify-content-between">
      <div class="flex align-items-center">
        <span class="text-md font-medium text-900"
          >รายการที่ {{ index + 1 }}</span
        >
      </div>
      <div>
        <Button
          v-if="!props.isUpdate"
          icon="pi pi-times"
          class="p-button-text p-button-plain p-button-rounded p-button-danger"
          @click="removeBoxVat(data, index)"
        ></Button>
      </div>
    </div>
    <div class="surface-border border-top-1 opacity-50 mb-0 col-12"></div>
    <div class="grid formgrid p-fluid">
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">วันที่ใบกำกับ</label>
        <Calendar
          dateFormat="dd/mm/yy"
          v-model="data.vatdate"
          :disabled="props.isUpdate"
          :class="props.vats_valid[index].vatdate ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">เลขที่ใบกำกับ</label>
        <InputText
          type="text"
          v-model="data.vatdocno"
          :disabled="props.isUpdate"
          :class="props.vats_valid[index].vatdocno ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">ชื่อ</label>
        <InputText
          type="text"
          v-model="data.custname"
          :disabled="props.isUpdate"
          :class="props.vats_valid[index].custname ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900"
          >เลขประจำตัวผู้เสียภาษี/เลขที่บัตรประชาชน</label
        >
        <InputText
          type="text"
          v-model="data.custtaxid"
          :disabled="props.isUpdate"
          :class="props.vats_valid[index].custtaxid ? 'p-invalid' : ''"
        />
      </div>

      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">สถานประกอบการ</label>
        <div class="flex mt-2">
          <div class="flex">
            <div class="field-radiobutton">
              <RadioButton
                name="organization"
                :value="0"
                :disabled="props.isUpdate"
                v-model="data.organization"
                @change="setBranch(index)"
              />
              <label>สำนักงานใหญ่</label>
            </div>
          </div>
          <div class="flex ml-4">
            <div class="field-radiobutton">
              <RadioButton
                name="organization"
                :value="1"
                :disabled="props.isUpdate"
                v-model="data.organization"
                @change="setBranch(index)"
              />
              <label>สาขา</label>
            </div>
          </div>
        </div>
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">ลำดับที่สาขา</label>
        <InputText
          type="text"
          v-model="data.branchcode"
          :disabled="data.organization == 0 || props.isUpdate"
          :class="props.vats_valid[index].branchcode ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">ปีภาษี</label>

        <InputText
          type="number"
          :min="0"
          :disabled="props.isUpdate"
          v-model="data.vatyear"
          :class="props.vats_valid[index].vatyear ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">เดือนภาษี</label>
        <InputText
          type="number"
          :min="1"
          :max="12"
          :disabled="props.isUpdate"
          v-model="data.vatperiod"
          @input="checkDateFormat(index)"
          :class="props.vats_valid[index].vatperiod ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">ฐานภาษี</label>

        <InputNumber
          v-model="data.vatbase"
          autofocus
          mode="decimal"
          :disabled="props.isUpdate"
          :maxFractionDigits="2"
          @update:modelValue="calVatAmount(index)"
          style="text-align: right"
          :class="props.vats_valid[index].vatbase ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">อัตราภาษี</label>

        <InputNumber
          v-model="data.vatrate"
          autofocus
          mode="decimal"
          :disabled="props.isUpdate"
          @update:modelValue="calVatAmount(index)"
          :maxFractionDigits="2"
          style="text-align: right"
          :class="props.vats_valid[index].vatrate ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">ภาษี</label>
        <div class="flex">
          <div class="flex">
            <div class="field-radiobutton">
              <RadioButton
                name="vatmode"
                :value="0"
                v-model="data.vatmode"
                :disabled="props.isUpdate"
              />
              <label>ภาษีซื้อ</label>
            </div>
          </div>
          <div class="flex ml-4">
            <div class="field-radiobutton">
              <RadioButton
                name="vatmode"
                :value="1"
                v-model="data.vatmode"
                :disabled="props.isUpdate"
              />
              <label>ภาษีขาย</label>
            </div>
          </div>
        </div>
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">ประเภทภาษี</label>
        <div class="flex">
          <div class="flex">
            <div class="field-radiobutton">
              <RadioButton
                name="vattype"
                :value="0"
                v-model="data.vattype"
                :disabled="props.isUpdate"
              />
              <label>ปกติ</label>
            </div>
          </div>
          <div class="flex ml-4" v-if="data.vatmode != '1'">
            <div class="field-radiobutton">
              <RadioButton
                name="vattype"
                :value="1"
                v-model="data.vattype"
                :disabled="props.isUpdate"
              />
              <label>ขอคืนไม่ได้</label>
            </div>
          </div>
          <div class="flex ml-4">
            <div class="field-radiobutton">
              <RadioButton name="vattype" :value="2" v-model="data.vattype" />
              <label>ไม่ถึงกำหนดชำระ</label>
            </div>
          </div>
        </div>
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">ยอดภาษี</label>
        <InputNumber
          v-model="data.vatamount"
          autofocus
          mode="decimal"
          :disabled="props.isUpdate"
          :maxFractionDigits="2"
          style="text-align: right"
          :class="props.vats_valid[index].vatamount ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">ยอดยกเว้นภาษี</label>

        <InputNumber
          v-model="data.exceptvat"
          autofocus
          mode="decimal"
          :maxFractionDigits="2"
          :disabled="props.isUpdate"
          style="text-align: right"
          :class="props.vats_valid[index].exceptvat ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12">
        <label class="font-medium text-900">หมายเหตุ</label>

        <Textarea
          id="notes"
          :autoResize="true"
          :rows="4"
          :disabled="props.isUpdate"
          v-model="data.remark"
        ></Textarea>
      </div>

      <div class="field col-12 mt-1">
        <div class="flex align-items-center">
          <Checkbox
            :binary="true"
            v-model="data.vatsubmit"
            :disabled="props.isUpdate"
          ></Checkbox>
          <span class="ml-2">ยื่นเพิ่ม</span>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-4 flex justify-content-end">
    <Button
      v-if="!props.isUpdate"
      icon="pi pi-plus"
      class="p-button-rounded p-button-success p-button-lg"
      @click="addBoxVat()"
    />
  </div>
  <DialogForm
    :confirmDialog="deleteDetailVatDialog"
    :textContent="'ต้องการลบข้อมูลภาษี รายการที่ ' + (del_data.index + 1)"
    v-on:close="deleteDetailVatDialog = false"
    v-on:confirm="deleteDetailVat"
  ></DialogForm>
  <!-- <Dialog
    v-model:visible="deleteDetailVatDialog"
    :style="{ width: '450px' }"
    header="Confirm"
    :modal="true"
  >
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span
        >ต้องการลบข้อมูลภาษี รายการที่
        <b> {{ del_data.index + 1 }}</b> ใช่หรือไม่?</span
      >
    </div>
    <template #footer>
      <Button
        label="No"
        icon="pi pi-times"
        class="p-button-text"
        @click="deleteDetailVatDialog = false"
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        class="p-button-text p-button-danger"
        @click="deleteDetailVat"
      />
    </template>
  </Dialog> -->
</template>
