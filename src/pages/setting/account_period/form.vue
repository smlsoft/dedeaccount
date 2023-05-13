<script setup>
import { ref, onUpdated, onMounted } from "vue";
import DatePicker from "@/components/widget/DatePicker.vue";
import $ from "jquery";

const props = defineProps({
  form_model: Object,
  form_valid: Object,
  startDateFocus: Boolean,
});

const buddhistYear = ref(process.env.VUE_APP_DATE == "th");

const emit = defineEmits([""]);

onMounted(() => {});

onUpdated(() => {
  // if (props.startDateFocus) {
  //   $(".startDate").focus();
  // }
});
</script>

<template>
  <div class="surface-card p-2 border-round p-fluid">
    <div class="mb-2">
      <Button
        label="บันทึกงวดบัญชี"
        icon="pi pi-save"
        class="w-auto p-button-success btnSave"
      ></Button>
    </div>

    <div class="grid formgrid mt-3">
      <div class="field col-6">
        <span class="p-float-label">
          <DatePicker
            v-model="props.form_model.startdate"
            dateFormat="d/m/yy"
            :showIcon="true"
            :buddhist="buddhistYear"
            :hideOnDateTimeSelect="false"
            :hiddenTime="true"
            inputClass="startDate"
          />
          <label>จากวันที่</label>
        </span>
      </div>
      <div class="field col-6">
        <span class="p-float-label">
          <DatePicker
            v-model="props.form_model.enddate"
            dateFormat="d/m/yy"
            :showIcon="true"
            :buddhist="buddhistYear"
            :hideOnDateTimeSelect="false"
            :hiddenTime="true"
            inputClass="endDate"
          />
          <label>ถึงวันที่</label>
        </span>
      </div>
      <div class="field col-6">
        <label class="font-medium text-900"> งวดลำดับที่</label>
        <InputNumber v-model="props.form_model.startAccountPeriod" />
      </div>
      <div class="field col-6">
        <label class="font-medium text-900">รายละเอียด</label>
        <InputText type="text" v-model="props.description" />
      </div>
      <div class="field col-12">
        <label class="font-medium text-900">สถานะ</label>
        <InputSwitch
          v-model="props.statusAccountPeriod"
          style="display: flex"
          class="mt-1"
        />
      </div>
    </div>
  </div>
</template>
