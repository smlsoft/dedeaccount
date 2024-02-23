<script setup>
import { ref, onMounted, computed, watch } from "vue";
import Utils from "@/utils/";
import DialogForm from "@/components/DialogForm.vue";
const deleteDetailTaxDialog = ref(false);
const del_data = ref({ data: null, index: 0 });

const conreject = ref("ต้องการลบข้อมูลภาษี");
const sum_taxamount = computed({
  get() {
    var sumtaxamount = 0;

    if (!props.isUpdate.value) {
      props.taxes.forEach((ele) => {
        if (ele.details != null && ele.details.length > 0) {
          var sum = 0;
          ele.details.forEach((data) => {
            sumtaxamount += data.taxamount;
            sum += data.taxamount;
          });
        }
      });
    } else {
      if (props.taxes.length > 0) {
        if (props.taxes[0].taxdocno != "") {
          sumtaxamount = props.taxes[0].taxamount;
        }
      }
    }
    return sumtaxamount.toFixed(2);
  },
});

const sum_taxbase = computed({
  get() {
    var sum = 0;
    props.taxes.forEach((ele) => {
      if (ele.details != null && ele.details.length > 0) {
        var sumbase = 0;
        ele.details.forEach((data) => {
          sum += data.taxbase;
          sumbase += data.taxbase;
        });
      }
    });
    return sum.toFixed(2);
  },
});
const props = defineProps({
  taxes: Object,
  taxes_valid: Object,
  id: String,
  isUpdate: Boolean,
});
const emit = defineEmits(["addBoxTax", "deleteDetailTax", "getSumTaxBase"]);

onMounted(async () => {});

function getSumTaxBase(data) {
  emit("getSumTaxBase", data);
}
function getSumTaxAmount(data) {
  console.log("getSumTaxAmount", data);
  var sum = 0;
  if (data != null && data.length > 0) {
    data.forEach((element) => {
      sum += element.taxamount;
    });
  }
  return sum.toFixed(2);
}

function removeBoxTax(data, index) {
  deleteDetailTaxDialog.value = true;
  del_data.value = { data: data, index: index };
}

function addBoxTax() {
  emit("addBoxTax");
}
function deleteDetailTax() {
  emit("deleteDetailTax", del_data.value.index);
  deleteDetailTaxDialog.value = false;
}

function onCellEditCompleteTax(event) {
  let { data, newValue, field, index, originalEvent } = event;

  data[field] = newValue;

  if (field == "taxbase" || field == "taxrate") {
    var sumtax = 0;

    sumtax = (parseFloat(data["taxrate"]) * parseFloat(data["taxbase"])) / 100;

    data["taxamount"] = sumtax;
  }

  // if (field == "description") {
  //   originalEvent.path[1].nextElementSibling.click();
  // } else if (field == "vatbase") {
  //   document.getElementsByClassName("vatrate_" + index)[0].click();
  // } else if (field == "vatrate") {
  //   document.getElementsByClassName("vatamount_" + index)[0].click();
  // } else if (field == "taxamount") {
  //   document.getElementsByClassName("vatbase_" + index)[0].click();
  // }

  addColumnTax();
}

function addColumnTax() {
  props.taxes.forEach((element) => {
    if (element.details[element.details.length - 1].description != "") {
      element.details.push({
        description: "",
        taxbase: 0,
        taxrate: 0,
        taxamount: 0,
      });
    }
  });
}

function deleteDetailTableTax(data, index) {
  console.log(data);
  props.taxes[index].details.splice(data, 1);
  if (props.taxes[index].details.length == 0) {
    props.taxes[index].details.push({
      description: "",
      taxbase: 0,
      taxrate: 0,
      taxamount: 0,
    });
  }
}
</script>

<template>
  <div
    class="flex justify-content-between flex-wrap m-0 mb-3 p-0 text-900 line-height-3"
  >
    <div class="flex align-items-center justify-content-center">
      รวมฐานภาษี : {{ Utils.formatCurrency(sum_taxbase) }} บาท
    </div>
    <div class="flex align-items-center justify-content-center font-bold">
      รวมภาษีหัก ณ ที่จ่าย : {{ Utils.formatCurrency(sum_taxamount) }} บาท
    </div>
  </div>
  <div
    class="surface-card p-4 shadow-2 mb-3 border-round"
    v-for="(data, indexx) in props.taxes"
    :key="indexx"
  >
    <div class="mb-0 flex align-items-center justify-content-between">
      <div class="flex align-items-center">
        <span class="text-md font-medium text-900"
          >รายการที่ {{ indexx + 1 }}</span
        >
      </div>
      <div>
        <Button
          v-if="!props.isUpdate"
          icon="pi pi-times"
          class="p-button-text p-button-plain p-button-rounded p-button-danger"
          @click="removeBoxTax(data, indexx)"
        ></Button>
      </div>
    </div>
    <div class="surface-border border-top-1 opacity-50 mb-0 col-12"></div>

    <div class="grid formgrid p-fluid">
      <div class="field col-12 md:col-12">
        <label class="font-medium text-900">ภาษี</label>
        <div class="flex">
          <div class="flex">
            <div class="field-radiobutton">
              <RadioButton
                name="taxtype"
                :value="0"
                v-model="data.taxtype"
                :disabled="props.isUpdate"
              />
              <label>ภาษีถูกหัก ณ ที่จ่าย</label>
            </div>
          </div>
          <div class="flex ml-4">
            <div class="field-radiobutton">
              <RadioButton
                name="taxtype"
                :value="1"
                v-model="data.taxtype"
                :disabled="props.isUpdate"
              />
              <label>ภาษีหัก ณ ที่จ่าย</label>
            </div>
          </div>
        </div>
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">วันที่หัก ณ ที่จ่าย</label>
        <Calendar
          :disabled="props.isUpdate"
          dateFormat="dd/mm/yy"
          v-model="data.taxdate"
          :class="props.taxes_valid[indexx].taxdate ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">เลขที่เอกสาร</label>
        <InputText
          :disabled="props.isUpdate"
          type="text"
          v-model="data.taxdocno"
          :class="props.taxes_valid[indexx].taxdocno ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">ชื่อ</label>
        <InputText
          :disabled="props.isUpdate"
          type="text"
          v-model="data.custname"
          :class="props.taxes_valid[indexx].custname ? 'p-invalid' : ''"
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
          :class="props.taxes_valid[indexx].custtaxid ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-12">
        <label class="font-medium text-900">ที่อยู่</label>
        <InputText
          type="text"
          v-model="data.address"
          :disabled="props.isUpdate"
          :class="props.taxes_valid[indexx].address ? 'p-invalid' : ''"
        />
      </div>
      <div class="field col-12 md:col-6">
        <label class="font-medium text-900">ประเภท</label>
        <div class="flex mt-2">
          <div class="flex">
            <div class="field-radiobutton">
              <RadioButton
                name="custtype"
                :value="0"
                v-model="data.custtype"
                :disabled="props.isUpdate"
              />
              <label>บุคคลธรรมดา</label>
            </div>
          </div>
          <div class="flex ml-4">
            <div class="field-radiobutton">
              <RadioButton
                name="custtype"
                :value="1"
                v-model="data.custtype"
                :disabled="props.isUpdate"
              />
              <label>นิติบุคคล</label>
            </div>
          </div>
        </div>
      </div>
      <div class="field col-12">
        <DataTable
          :value="data.details"
          editMode="cell"
          @cell-edit-complete="onCellEditCompleteTax"
          class="editable-cells-table"
          responsiveLayout="scroll"
        >
          <Column
            field="description"
            header="รายละเอียด"
            bodyStyle="text-align: left !important"
            headerStyle="text-align:center;width: 20%"
            footerStyle="text-align: right !important"
            footer="รวม"
          >
            <template #body="{ data, field }">
              {{ data[field] }}
            </template>

            <template #editor="{ data, field, index }" v-if="!props.isUpdate">
              <InputText v-model="data[field]" autofocus :id="'des_' + index" />
            </template>
          </Column>
          <Column
            field="taxbase"
            header="ฐานภาษี"
            :bodyClass="'vatbase_' + indexx"
            footerStyle="text-align: right !important"
            bodyStyle="text-align: right !important"
            headerStyle="text-align:center;width: 10%"
            style="width: 13%"
          >
            <template #footer>
              {{ getSumTaxBase(data.details) }}
            </template>
            <template #body="{ data, field }">
              {{ Utils.formatCurrency(data[field]) }}
            </template>

            <template #editor="{ data, field }" v-if="!props.isUpdate">
              <InputNumber
                v-model="data[field]"
                autofocus
                mode="decimal"
                :maxFractionDigits="2"
                style="text-align: right"
              />
            </template>
          </Column>

          <Column
            field="taxrate"
            header="อัตรา"
            bodyStyle="text-align: right !important"
            headerStyle="text-align:center;width: 10%"
            style="width: 13%"
          >
            <template #body="{ data, field }">
              {{ Utils.formatCurrency(data[field]) }}
            </template>

            <template #editor="{ data, field }" v-if="!props.isUpdate">
              <InputNumber
                v-model="data[field]"
                autofocus
                mode="decimal"
                :maxFractionDigits="2"
                style="text-align: right"
              />
            </template>
          </Column>

          <Column
            field="taxamount"
            header="ภาษีหัก ณ ที่จ่าย"
            footerStyle="text-align: right !important"
            style="text-align: right !important"
            headerStyle="text-align:center;width: 10%"
          >
            <template #footer>
              {{
                 getSumTaxAmount(data.details)
              }}
            </template>
            <template #body="{ data, field }">
              {{ Utils.formatCurrency(data[field]) }}
            </template>
          </Column>
          <Column
            header="ลบ"
            bodyStyle="text-align:center"
            style="width: 5%"
            v-if="!props.isUpdate"
          >
            <template #body="slotProps">
              <Button
                icon="pi pi-times"
                class="p-button-rounded p-button-danger p-button-text"
                @click="deleteDetailTableTax(slotProps.index, indexx)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
  <div class="mt-4 flex justify-content-end">
    <Button
      v-if="!props.isUpdate"
      icon="pi pi-plus"
      class="p-button-rounded p-button-success p-button-lg"
      @click="addBoxTax()"
    />
  </div>

  <DialogForm
    :confirmDialog="deleteDetailTaxDialog"
    :textContent="conreject"
    v-on:close="deleteDetailTaxDialog = false"
    v-on:confirm="deleteDetailTax"
  ></DialogForm>
</template>
