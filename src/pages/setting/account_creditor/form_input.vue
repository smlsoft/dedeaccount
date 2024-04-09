<script setup>
import { ref, onUpdated, onMounted } from "vue";
import $ from "jquery";

const props = defineProps({
  form_model: Object,
  form_valid: Object,
  creditorCodeFocus: Boolean,
  readMode: Boolean,
});

const emit = defineEmits(["unFocusCreditorCode", "onSave"]);

onMounted(() => {});

onUpdated(() => {
  if (props.creditorFocus) {
    $(".creditorCodeFocus").focus();
  }
});

function onSave() {
  emit("onSave");
}

function unFocusCreditorCode() {
  emit("unFocusCreditorCode");
}

function headerNextFocus(filedName) {
  if (filedName == "name") {
    $(".name").focus();
  } else if (filedName == "taxid") {
    $(".taxid").focus();
  } else if (filedName == "address") {
    $(".address").focus();
  } else if (filedName == "phoneprimary") {
    $(".phoneprimary").focus();
  } else if (filedName == "onSave") {
    onSave();
  }
}

function updatePersonalType(type) {
  this.props.form_model.personaltype = type;
  return this.props.form_model.personaltype;
}
function updateCustomertype(type) {
  this.props.form_model.customertype = type;
  if (type == 0) {
    this.props.form_model.branchnumber = "00000";
  } else {
    this.props.form_model.branchnumber = "";
  }
}
</script>

<template>
  <div class="p-2">
    <Button
      :disabled="readMode"
      @click="onSave"
      label="บันทึกเจ้าหนี้"
      icon="pi pi-save"
      class="w-auto p-button-success btnSave"
    ></Button>
  </div>
  <div class="surface-card p-2 border-round p-fluid">
    <div class="grid formgrid mt-1">
      <div class="field col-6 md:col-12">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.code"
            :class="!props.form_valid.code ? 'p-invalid ' : ''"
            class="code"
            @blur="unFocusCreditorCode"
            @keyup.enter="headerNextFocus('name')"
          />
          <label>รหัสเจ้าหนี้</label>
        </span>
      </div>

      <div class="field col-6 md:col-12">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.name"
            :class="!props.form_valid.name ? 'p-invalid ' : ''"
            class="name"
            @keyup.enter="headerNextFocus('taxid')"
          />
          <label>ชื่อเจ้าหนี้</label>
        </span>
      </div>

      <div class="field col-6 md:col-12">
        <input
          type="radio"
          id="naturalperson"
          name="personaltype"
          class="personaltype"
          value="0"
          :disabled="readMode"
          v-model="props.form_model.personaltype"
          :class="!props.form_valid.personaltype ? 'p-invalid ' : ''"
          @change="updatePersonalType(0)"
        />
        <label for="naturalperson">บุคคลธรรมดา</label>
        <input
          type="radio"
          id="juristicperson"
          name="personaltype"
          class="personaltype"
          value="1"
          :disabled="readMode"
          v-model="props.form_model.personaltype"
          :class="!props.form_valid.personaltype ? 'p-invalid ' : ''"
          @change="updatePersonalType(1)"
        />
        <label for="juristicperson">นิติบุคคล</label>
      </div>

      <div class="field col-6 md:col-12">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.taxid"
            :class="!props.form_valid.taxid ? 'p-invalid ' : ''"
            class="taxid"
            @keyup.enter="headerNextFocus('address')"
          />
          <label>เลขที่บัตรประชาชน/เลขที่ผู้เสียภาษี</label>
        </span>
      </div>

      <div class="field col-6 md:col-12">
        <input
          type="radio"
          id="headbranch"
          name="customertype"
          class="customertype"
          value="0"
          :disabled="readMode"
          v-model="props.form_model.customertype"
          :class="!props.form_valid.customertype ? 'p-invalid ' : ''"
          @change="updateCustomertype(0)"
        />
        <label for="headbranch">สำนักงานใหญ่</label>
        <input
          type="radio"
          id="subbranch"
          name="customertype"
          class="customertype"
          value="1"
          :disabled="readMode"
          v-model="props.form_model.customertype"
          :class="!props.form_valid.customertype ? 'p-invalid ' : ''"
          @change="updateCustomertype(1)"
        />
        <label for="subbranch">สาขา</label>
      </div>

      <div class="field col-6 md:col-12">
        <span class="p-float-label">
          <InputText
            :disabled="readMode || props.form_model.customertype == 0"
            v-model="props.form_model.branchnumber"
            :class="!props.form_valid.branchnumber ? 'p-invalid ' : ''"
            class="branchnumber"
            @keyup.enter="headerNextFocus('address')"
          />
          <label>หมายเลขสาขา</label>
        </span>
      </div>

      <div class="field col-6 md:col-12">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.address"
            :class="!props.form_valid.address ? 'p-invalid ' : ''"
            class="address"
            @keyup.enter="headerNextFocus('phoneprimary')"
          />

          <label>ที่อยู่</label>
        </span>
      </div>

      <div class="field col-6 md:col-12">
        <span class="p-float-label">
          <InputText
            maxlength="10"
            :disabled="readMode"
            v-model="props.form_model.phoneprimary"
            :class="!props.form_valid.phoneprimary ? 'p-invalid ' : ''"
            class="phoneprimary"
            @keyup.enter="headerNextFocus('onSave')"
          />
          <label>หมายเลขโทรศัพท์</label>
        </span>
      </div>
    </div>
  </div>
</template>

<style></style>
