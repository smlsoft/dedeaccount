<script setup>
import { ref, onUpdated, onMounted, computed } from "vue";
import $ from "jquery";
import Utils from "@/utils/";
import TextAutoComplete from "@/components/widget/TextAutoComplete.vue";
import TextInputNumber from "@/components/widget/TextInputNumber.vue";

const deleteDetailDialog = ref(false);
const detail = ref();
const filteredCountries = ref();
const sumTableDebit = computed({
  get() {
    let sum = 0;
    props.form_model.details.forEach((ele) => {
      if (ele.debit == null) {
        ele.debit = 0;
      }
      sum += parseFloat(ele.debit);
    });
    return sum.toFixed(2);
  },
});
const sumTableCredit = computed({
  get() {
    var sum = 0;
    props.form_model.details.forEach((ele) => {
      if (ele.credit == null) {
        ele.credit = 0;
      }
      sum += parseFloat(ele.credit);
    });
    return sum.toFixed(2);
  },
});

const props = defineProps({
  form_model: Object,
  form_valid: Object,
  docCodeFocus: Boolean,
  readMode: Boolean,
  accountChart_detail: Array,
});

const emit = defineEmits([
  "unFocusGroupCode",
  "onSave",
  "onRowReorder",
  "selectAccount",
  "addColumn",
  "deleteDetail",
]);

onMounted(() => {});

onUpdated(() => {
  if (props.docCodeFocus) {
    $(".doccode").focus();
  }
});

function onSave() {
  emit("onSave");
}

function unFocusGroupCode() {
  emit("unFocusGroupCode");
}

function headerNextFocus(filedName) {
  if (filedName == "description") {
    $(".description").focus();
  } else if (filedName == "btnSave") {
    onSave();
  }
}

function onRowReorder(event) {
  emit("onRowReorder", event.value);
}

function searchAccount(event) {
  setTimeout(() => {
    console.log(event.query);
    if (!event.query.trim().length) {
      filteredCountries.value = props.accountChart_detail;
    } else {
      filteredCountries.value = props.accountChart_detail.filter((account) => {
        if (
          account.accountcode
            .toLowerCase()
            .includes(event.query.toLowerCase()) ||
          account.accountname.toLowerCase().includes(event.query.toLowerCase())
        ) {
          return true;
        }
      });
    }
  }, 250);
}

function selectAccount(data, field, index) {
  emit("selectAccount", data, index);
  focusNext(field, index);
}

function focusNext(field, index) {
  console.log(field);
  setTimeout(() => {
    if (field == "actioncode") {
      $(".accountcode_" + index + " > input").focus();
    } else if (field == "accountcode") {
      $(".debit_" + index + " > input").focus();
    } else if (field == "debit") {
      $(".credit_" + index + " > input ").focus();
    } else if (field == "credit") {
      addColumn(index);
      setTimeout(() => {
        if (props.form_model.details.length > index + 1) {
          $(".actioncode_" + (index + 1) + " > input").focus();
        }
      }, 100);
    }
  }, 100);
}

function addColumn(index) {
  emit("addColumn", index);
}

function confirmDeleteDetail(data, index) {
  // console.log(index);
  detail.value = data;
  detail.value.index = index;
  // console.log(detail);
  deleteDetailDialog.value = true;
}

function deleteDetail() {
  // console.log(detail.value.index);
  emit("deleteDetail", detail.value.index);
  deleteDetailDialog.value = false;
}
</script>

<template>
  <div class="surface-card p-2 border-round p-fluid">
    <div class="mb-2">
      <Button
        :disabled="props.readMode"
        @click="onSave"
        label="บันทึกรูปแบบการบันทึกบัญชี"
        icon="pi pi-save"
        class="w-auto p-button-success btnSave"
      ></Button>
    </div>
    <div class="grid formgrid mt-3">
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <InputText
            :disabled="props.readMode"
            v-model="props.form_model.doccode"
            :class="!props.form_valid.doccode ? 'p-invalid ' : ''"
            class="doccode"
            @blur="unFocusGroupCode"
            @keyup.enter="headerNextFocus('description')"
          />
          <label>รหัสรูปแบบบันทึกบัญชี</label>
        </span>
      </div>
      <div class="field col-6 md:col-6">
        <span class="p-float-label">
          <InputText
            :disabled="props.readMode"
            v-model="props.form_model.description"
            :class="!props.form_valid.description ? 'p-invalid ' : ''"
            class="description"
          />
          <label>ชื่อรูปแบบบันทึกบัญชี</label>
        </span>
      </div>
      <div class="col-12">
        <DataTable
          :value="props.form_model.details"
          :reorderableColumns="false"
          @rowReorder="onRowReorder"
          class="editable-cells-table"
          responsiveLayout="scroll"
        >
          <Column
            header="ย้าย"
            :rowReorder="true"
            style="width: 5%"
            v-if="!props.readMode"
          >
          </Column>
          <Column
            field="actioncode"
            header="Action Code"
            headerStyle="text-align:center;width: 15%"
            style="min-width: 80px"
          >
            <template #body="{ data, field }" v-if="props.readMode">
              {{ data[field] }}
            </template>

            <template #body="{ data, field, index }" v-if="!props.readMode">
              <InputText
                :class="'actioncode_' + index"
                v-model="data[field]"
                @enter="focusNext(field, index)"
              ></InputText>
            </template>
          </Column>
          <Column
            field="accountcode"
            header="รหัสบัญชี"
            style="min-width: 150px"
          >
            <template #body="{ data, field, index }" v-if="!props.readMode">
              <TextAutoComplete
                v-model="data[field]"
                :suggestions="filteredCountries"
                @complete="searchAccount($event)"
                :class="'accountcode_' + index"
                :dropdown="false"
                optionLabel="accountcode"
                @item-select="selectAccount(data[field], field, index)"
              >
                <template #item="slotProps">
                  <div class="ml-2">
                    {{ slotProps.item.accountcode }} ~
                    {{ slotProps.item.accountname }}
                  </div>
                </template>
              </TextAutoComplete>
            </template>
          </Column>
          <Column
            field="detail"
            header="ชื่อบัญชี"
            style="min-width: 200px"
            footerStyle="text-align: right !important"
            footer="รวม"
          >
          </Column>

          <Column
            field="debit"
            header="เดบิต"
            footerStyle="text-align: right !important"
            :footer="Utils.formatCurrency(sumTableDebit)"
            bodyStyle="text-align: right !important"
            headerStyle="text-align:center;width: 15%"
            style="min-width: 100px"
          >
            <template #body="{ data, field }" v-if="props.readMode">
              {{ Utils.formatCurrency(data[field]) }}
            </template>

            <template #body="{ data, field, index }" v-if="!props.readMode">
              <TextInputNumber
                :class="'debit_' + index"
                v-model="data[field]"
                mode="decimal"
                :maxFractionDigits="2"
                @enter="focusNext(field, index)"
              />
            </template>
          </Column>

          <Column
            field="credit"
            header="เครดิต"
            footerStyle="text-align: right !important"
            :footer="Utils.formatCurrency(sumTableCredit)"
            bodyStyle="text-align: right !important"
            headerStyle="text-align:center;width: 15%"
            style="min-width: 100px"
          >
            <template #body="{ data, field }" v-if="props.readMode">
              {{ Utils.formatCurrency(data[field]) }}
            </template>
            <template #body="{ data, field, index }" v-if="!props.readMode">
              <TextInputNumber
                :class="'credit_' + index"
                v-model="data[field]"
                mode="decimal"
                :maxFractionDigits="2"
                @enter="focusNext(field, index)"
              />
            </template>
          </Column>

          <Column
            header="ลบ"
            bodyStyle="text-align:center"
            style="width: 5%"
            v-if="!props.readMode"
          >
            <template #body="slotProps">
              <Button
                icon="pi pi-times"
                class="p-button-rounded p-button-danger p-button-text"
                @click="confirmDeleteDetail(slotProps.data, slotProps.index)"
              />
            </template>
          </Column>
          <Column
            header="เพิ่ม"
            bodyStyle="text-align:center"
            style="width: 5%"
            v-if="!props.readMode"
          >
            <template #body="slotProps">
              <Button
                icon="pi pi-plus"
                class="p-button-rounded p-button-success p-button-text"
                @click="addColumn(slotProps.index)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="deleteDetailDialog"
    :style="{ width: '450px' }"
    header="Confirm"
    :modal="true"
  >
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span
        >Are you sure you want to delete <b>{{ detail.accountname }}</b> ?</span
      >
    </div>
    <template #footer>
      <Button
        label="No"
        icon="pi pi-times"
        class="p-button-text"
        @click="deleteDetailDialog = false"
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        class="p-button-text"
        @click="deleteDetail"
      />
    </template>
  </Dialog>
</template>
