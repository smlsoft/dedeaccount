<script setup>
import { ref, onMounted, computed, watch } from "vue";
import Utils from "@/utils/";
import DialogForm from "@/components/DialogForm.vue";
import DatePicker from "@/components/widget/DatePicker.vue";

const deleteDetailTaxDialog = ref(false);
const del_data = ref({ data: null, index: 0 });
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");

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
  debtorData: Object, // เพิ่ม props สำหรับรับข้อมูลลูกหนี้
  creditorData: Object, // เพิ่ม props สำหรับรับข้อมูลเจ้าหนี้
  debtaccounttype: String, // เพิ่ม props สำหรับตรวจสอบประเภทบัญชี (ลูกหนี้/เจ้าหนี้)
});
const emit = defineEmits(["addBoxTax", "deleteDetailTax", "getSumTaxBase"]);

onMounted(async () => {});

// เพิ่ม watch สำหรับติดตามการเปลี่ยนแปลงของ debtorData และ creditorData
watch(
  () => [props.debtorData, props.creditorData, props.debtaccounttype],
  ([newDebtorData, newCreditorData, newDebtAccountType]) => {
    console.log("TAX Form - Props changed:", { newDebtorData, newCreditorData, newDebtAccountType });
    
    // อัปเดตข้อมูลใน TAX items ที่มีอยู่แล้ว
    if (props.taxes && props.taxes.length > 0) {
      props.taxes.forEach((tax, index) => {
        // ถ้ายังไม่มีข้อมูลชื่อผู้เสียภาษี ให้เติมข้อมูลใหม่
        if (!tax.custname || tax.custname === "") {
          if (newDebtAccountType === "0" && newDebtorData) {
            fillTaxDataFromContact(index, newDebtorData);
          } else if (newDebtAccountType === "1" && newCreditorData) {
            fillTaxDataFromContact(index, newCreditorData);
          }
        }
      });
    }
  },
  { deep: true, immediate: true }
);

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
  // ใช้วันที่เอกสารจาก parent component ผ่าน props หรือวันที่ปัจจุบัน
  const taxDate = Utils.getDateTime(); // ค่าเริ่มต้น
  
  // กำหนด custtype ตาม debtaccounttype และข้อมูลลูกหนี้/เจ้าหนี้
  let custType = 0; // default เป็นบุคคลธรรมดา
  
  if (props.debtaccounttype === "0" && props.debtorData) {
    // ใช้ข้อมูลลูกหนี้
    custType = props.debtorData.custtype || 0;
  } else if (props.debtaccounttype === "1" && props.creditorData) {
    // ใช้ข้อมูลเจ้าหนี้
    custType = props.creditorData.custtype || 0;
  }

  emit("addBoxTax");
  
  // เพิ่มการตรวจสอบว่ามีข้อมูลลูกหนี้หรือเจ้าหนี้หรือไม่ และใช้ข้อมูลนั้นเติมในรายการล่าสุดที่เพิ่ม
  setTimeout(() => {
    const lastIndex = props.taxes.length - 1;
    if (lastIndex >= 0) {
      // ตั้งค่า custtype
      if (props.taxes[lastIndex]) {
        props.taxes[lastIndex].custtype = custType;
      }
      
      // ตรวจสอบประเภทบัญชีและดึงข้อมูลที่เหมาะสม
      if (props.debtaccounttype === "0" && props.debtorData) {
        // ใช้ข้อมูลลูกหนี้
        fillTaxDataFromContact(lastIndex, props.debtorData);
      } else if (props.debtaccounttype === "1" && props.creditorData) {
        // ใช้ข้อมูลเจ้าหนี้
        fillTaxDataFromContact(lastIndex, props.creditorData);
      }
    }
  }, 100);
}

// เพิ่มฟังก์ชันใหม่สำหรับเติมข้อมูลภาษีจากข้อมูลลูกหนี้/เจ้าหนี้
function fillTaxDataFromContact(index, contactData) {
  if (contactData && props.taxes[index]) {
    console.log("Filling TAX data from contact:", contactData);
    
    // เติมข้อมูลชื่อผู้เสียภาษี
    if (contactData.names && contactData.names.length > 0) {
      const thaiName = contactData.names.find(n => n.code === "th");
      if (thaiName && thaiName.name) {
        props.taxes[index].custname = thaiName.name;
      }
    }
    
    // เติมเลขประจำตัวผู้เสียภาษี
    if (contactData.taxid) {
      props.taxes[index].custtaxid = contactData.taxid;
    }
    
    // เติม custtype จากข้อมูลลูกหนี้/เจ้าหนี้
    if (contactData.custtype !== undefined && contactData.custtype !== null) {
      props.taxes[index].custtype = contactData.custtype;
    }
    
    // สร้างที่อยู่จากข้อมูลที่มี
    if (contactData.addressforbilling) {
      let address = "";
      
      if (contactData.addressforbilling.address && contactData.addressforbilling.address.length > 0) {
        address = contactData.addressforbilling.address.join(" ");
      }
      
      props.taxes[index].address = address;
    }
  }
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
  <div style="height: 100%; display: flex; flex-direction: column; overflow-y: auto;">
  <!-- Sticky Header with Summary and Add Button -->
  <div class="tax-sticky-header surface-card">
    <div class="flex justify-content-between align-items-center flex-wrap">
      <div class="flex align-items-center gap-4">
        <div class="flex align-items-center">
          <span class="text-sm text-600">รวมฐานภาษี:</span>
          <span class="ml-2 font-semibold text-900">{{ Utils.formatCurrency(sum_taxbase) }} บาท</span>
        </div>
        <div class="flex align-items-center">
          <span class="text-sm text-600">รวมภาษีหัก ณ ที่จ่าย:</span>
          <span class="ml-2 font-bold text-900 text-primary">{{ Utils.formatCurrency(sum_taxamount) }} บาท</span>
        </div>
      </div>
      <Button
        v-if="!props.isUpdate"
        label="เพิ่มรายการ"
        icon="pi pi-plus"
        class="p-button-success mt-2"
        @click="addBoxTax()"
      />
    </div>
  </div>

  <div class="tax-scroll-container">
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
          <DatePicker
            dateFormat="d/m/yy"
            v-model="data.taxdate"
            :modelValue="data.taxdate"
            :showIcon="true"
            :disabled="props.isUpdate"
            :class="props.taxes_valid[indexx].taxdate ? 'p-invalid' : ''"
            :buddhist="buddhistYear"
            :hideOnDateTimeSelect="true"
            :hiddenTime="true"
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
  </div>

  <DialogForm
    :confirmDialog="deleteDetailTaxDialog"
    :textContent="conreject"
    v-on:close="deleteDetailTaxDialog = false"
    v-on:confirm="deleteDetailTax"
  ></DialogForm>
  </div>
</template>

<style scoped>
/* Sticky Header */
.tax-sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--surface-border);
  background: var(--surface-card);
}
</style>
