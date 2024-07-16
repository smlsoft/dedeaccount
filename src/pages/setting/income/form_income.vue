<template>
  <div class="surface-card p-2 border-round p-fluid">
    <div class="mb-2">
      <Button
        :disabled="readMode"
        @click="onSave"
        label="บันทึกรายได้"
        icon="pi pi-save"
        class="w-auto p-button-success btnSave"
      />
    </div>
    <div class="grid formgrid mt-3">
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.code"
            :class="!props.form_valid.code ? 'p-invalid' : ''"
            class="incomeCode"
            @blur="unFocusincomeCode"
            @keyup.enter="headerNextFocus('name1')"
          />
          <label>รหัสรายได้</label>
        </span>
      </div>
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <InputText
            :disabled="readMode"
            v-model="props.form_model.names[0].name"
            :class="!props.form_valid.name1 ? 'p-invalid' : ''"
            class="name1"
            @keyup.enter="headerNextFocus('accountcode')"
          />
          <label>ชื่อรายได้</label>
        </span>
      </div>
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <TextAutoComplete
            v-model="props.form_model.accountcode"
            :suggestions="filteredCountries"
            @complete="searchAccount"
            :dropdown="false"
            optionLabel="accountcode"
            @item-select="selectAccount"
            inputClass="accountcode"
            :disabled="readMode"
          >
            <template #item="slotProps">
              <div class="ml-2">{{ slotProps.item.accountcode }} ~ {{ slotProps.item.accountname }}</div>
            </template>
          </TextAutoComplete>
          <label>ค้นหา : รหัสบัญชี</label>
        </span>
      </div>
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <InputText :disabled="true" v-model="props.form_model.accountname" />
          <label>ชื่อบัญชี</label>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUpdated } from "vue";
import $ from "jquery";
import TextAutoComplete from "@/components/widget/TextAutoComplete.vue";

const filteredCountries = ref();

const props = defineProps({
  form_model: Object,
  form_valid: Object,
  incomeCodeFocus: Boolean,
  readMode: Boolean,
  accountChart_list: Array,
});

const emit = defineEmits(["unFocusincomeCode", "onSave"]);

onUpdated(() => {
  if (props.incomeCodeFocus) {
    $(".incomeCode").focus();
  }
});

function onSave() {
  emit("onSave");
}

function unFocusincomeCode() {
  emit("unFocusincomeCode");
}

function headerNextFocus(filedName) {
  if (filedName === "name1") {
    $(".name1").focus();
  } else if (filedName === "accountcode") {
    $(".accountcode").focus();
  } else if (filedName === "btnSave") {
    onSave();
  }
}

function selectAccount(event) {
  props.form_model.accountcode = event.value.accountcode;
  props.form_model.accountname = event.value.accountname;
}

function searchAccount(event) {
  props.form_model.accountname = "";
  setTimeout(() => {
    filteredCountries.value = event.query.trim().length
      ? props.accountChart_list.filter(account => 
          account.accountcode.toLowerCase().includes(event.query.toLowerCase()) ||
          account.accountname.toLowerCase().includes(event.query.toLowerCase())
        )
      : props.accountChart_list;
  }, 250);
}
</script>
