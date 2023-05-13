<script setup>
import { ref, onUpdated, onMounted } from "vue";
import $ from "jquery";

const props = defineProps({
  form_model: Object,
  form_valid: Object,
  bookCodeFocus: Boolean,
  readMode: Boolean,
});

const emit = defineEmits(["unFocusBookCode", "onSave"]);

onMounted(() => {});

onUpdated(() => {
  if (props.bookCodeFocus) {
    $(".bookcode").focus();
  }
});

function onSave() {
  emit("onSave");
}

function unFocusBookCode() {
  emit("unFocusBookCode");
}

function headerNextFocus(filedName) {
  if (filedName == "name1") {
    $(".name1").focus();
  } else if (filedName == "name2") {
    $(".name2").focus();
  } else if (filedName == "name3") {
    $(".name3").focus();
  } else if (filedName == "name4") {
    $(".name4").focus();
  } else if (filedName == "name5") {
    $(".name5").focus();
  } else if (filedName == "btnSave") {
    onSave();
  }
}
</script>

<template>
  <div class="surface-card p-2 border-round p-fluid">
    <div class="mb-2">
      <Button
        :disabled="readMode"
        @click="onSave"
        label="บันทึกสมุดรายวัน"
        icon="pi pi-save"
        class="w-auto p-button-success btnSave"
      ></Button>
    </div>
    <div class="grid formgrid mt-3">
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.code"
            :class="!props.form_valid.code ? 'p-invalid ' : ''"
            class="bookcode"
            @blur="unFocusBookCode"
            @keyup.enter="headerNextFocus('name1')"
          />
          <label>รหัสสมุดรายวัน</label>
        </span>
      </div>
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.name1"
            :class="!props.form_valid.name1 ? 'p-invalid ' : ''"
            class="name1"
            @keyup.enter="headerNextFocus('name2')"
          />
          <label>ชื่อสมุดรายวัน 1</label>
        </span>
      </div>
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.name2"
            :class="!props.form_valid.name2 ? 'p-invalid ' : ''"
            class="name2"
            @keyup.enter="headerNextFocus('name3')"
          />
          <label>ชื่อสมุดรายวัน 2</label>
        </span>
      </div>
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.name3"
            :class="!props.form_valid.name3 ? 'p-invalid ' : ''"
            class="name3"
            @keyup.enter="headerNextFocus('name4')"
          />
          <label>ชื่อสมุดรายวัน 3</label>
        </span>
      </div>
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.name4"
            :class="!props.form_valid.name4 ? 'p-invalid ' : ''"
            class="name4"
            @keyup.enter="headerNextFocus('name5')"
          />
          <label>ชื่อสมุดรายวัน 4</label>
        </span>
      </div>
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.name5"
            :class="!props.form_valid.name5 ? 'p-invalid ' : ''"
            class="name5"
            @keyup.enter="headerNextFocus('btnSave')"
          />
          <label>ชื่อสมุดรายวัน 5</label>
        </span>
      </div>
    </div>
  </div>
</template>
