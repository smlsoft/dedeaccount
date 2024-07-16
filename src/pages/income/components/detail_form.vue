<script setup>
import { ref, onMounted, computed, watch } from "vue";
import Utils from "@/utils/";
import BillingCalculator from "@/utils/calculator";
import DatePicker from "@/components/widget/DatePicker.vue";
import AccountPeriodDataService from "@/services/AccountPeriodService";
import TextInputNumber from "@/components/widget/TextInputNumber.vue";
import TextAutoComplete from "@/components/widget/TextAutoComplete.vue";
import $ from "jquery";
import dayjs from "dayjs";
import DialogWarringPeriod from "@/components/DialogWarringPeriod.vue";
import { useToast } from "primevue/usetoast";

// Create an instance of BillingCalculator
const calculator = new BillingCalculator();
const toast = useToast();
const tempCheckDate = ref(null);
const deleteDetailDialog = ref(false);
const update_mode = ref(false);
const detail = ref();
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const filteredCountries = ref();
const warringAccountperiod = ref(false);
const vatTypeList = ref([
  { code: 1, name: "ภาษีแยกนอก" },
  { code: 2, name: "ภาษีรวมใน" },
  { code: 3, name: "ภาษีอัตราศูนย์" },
  { code: 4, name: "ไม่กระทบภาษี" },
]);

const inquiryTypeList = ref([
  { code: 1, name: "เงินเชื่อ" },
  { code: 2, name: "เงินสด" },
]);

const paymenttypeList = ref([
  { code: 1, name: "เงินสด" },
  { code: 3, name: "โอน" },
]);

/// รายวัน

const props = defineProps({
  income_form: Object,
  income_form_valid: Object,
  isUpdate: Boolean,
  income_detail: Array,
  customer_detail: Array,
  id: String,
});

const emit = defineEmits([
  "deleteDetail",
  "addColumn",
  "onRowReorder",
  "selectIncome",
  "setAccountPeriod",
  "getDocNo",
]);

const sumTableAmount = computed({
  get() {
    let sum = 0;
    props.income_form.incomedetail.forEach((ele) => {
      if (ele.amount == null) {
        ele.amount = 0.0;
      }
      sum += parseFloat(ele.amount);
      props.income_form.totalvalue = sum;
    });
    return sum.toFixed(2);
  },
});

onMounted(async () => {
  checkAccountPeriod(props.income_form.docdate);
});

function selectIncome(data, field, index) {
  emit("selectIncome", data, index);
  focusNext(field, index);
}

function onRowReorder(event) {
  emit("onRowReorder", event.value);
}

function addColumn(index) {
  emit("addColumn", index);
}

function deleteDetail() {
  console.log(detail.value.index);
  emit("deleteDetail", detail.value.index);
  deleteDetailDialog.value = false;
}

function confirmDeleteDetail(data, index) {
  detail.value = data;
  detail.value.index = index;
  deleteDetailDialog.value = true;
}

function searchIncome(event) {
  setTimeout(() => {
    if (!event.query.trim().length) {
      filteredCountries.value = props.income_detail;
    } else {
      filteredCountries.value = props.income_detail.filter((income) => {
        if (
          income.code.toLowerCase().includes(event.query.toLowerCase()) ||
          income.names[0].name.toLowerCase().includes(event.query.toLowerCase())
        ) {
          return true;
        }
        return false;
      });
    }
  }, 250);
}

function focusNext(field, index) {
  setTimeout(() => {
    if (field === "incomecode") {
      $(`.description_${index}`).focus();
    } else if (field === "description") {
      $(`.amount_${index} > input`).focus();
    } else if (field === "amount") {
      addColumn(index);
      setTimeout(() => {
        if (props.income_form.incomedetail.length > index + 1) {
          $(`.incomecode${index + 1} > input`).focus();
        }
      }, 100);
    }
  }, 100);
}

function checkAccountPeriod(event) {
  if (tempCheckDate.value != null) {
    clearTimeout(tempCheckDate.value);
  }
  tempCheckDate.value = setTimeout(() => {
    const keyDate = Utils.getDateFromYear(event);
    getAccountPeriodByDate(dayjs(keyDate).format("YYYY-MM-DD"));
  }, 100);

  headerNextFocus("docno");
}

function getAccountPeriodByDate(keyDate) {
  AccountPeriodDataService.getAccountPeriodByDate(keyDate)
    .then((res) => {
      if (res.success && res.data[0].perioddata.guidfixed !== "") {
        emit("setAccountPeriod", res.data[0].perioddata.period);
      } else {
        emit("setAccountPeriod", null);
        warringAccountperiod.value = true;
      }
    })
    .catch((err) => {
      console.log(err.response.data.message);
      emit("setAccountPeriod", null);
      warringAccountperiod.value = true;
    });
}

function headerNextFocus(filedName) {
  setTimeout(() => {
    const fieldMap = {
      docdate: ".docdate",
      docno: ".docno",
      exdocrefdate: ".exdocrefdate",
      exdocrefno: ".exdocrefno",
      debtor: ".debtor",
      vatttype: ".vatttype",
      inquirytype: ".inquirytype",
      accountdescription: ".accountdescription",
    };
    $(fieldMap[filedName]).focus();
  }, 100);
}

function calculateTotal() {
  props.income_form.discountvalue = 0;
  props.income_form.totalbeforevat = 0;
  props.income_form.totalvatvalue = 0;

  const totalDiscount = calculator.calculateTotalDiscount(
    props.income_form.totalvalue,
    props.income_form.discount
  );
  const totalBeforeVat = calculator.calculateTotalBeforeVat(
    props.income_form.totalvalue - totalDiscount,
    props.income_form.vatrate,
    props.income_form.vattype,
    props.income_form.discount
  );
  const totalVatValue = calculator.calculateTotalVatValue(
    props.income_form.totalvalue - totalDiscount,
    totalBeforeVat,
    props.income_form.vatrate,
    props.income_form.vattype
  );

  const totalAfterVat = calculator.calculateTotalAfterVat(
    totalBeforeVat,
    totalVatValue
  );

  const totalExceptVat = calculator.calculateTotalExceptVat();

  const totalamount = calculator.calculateTotalAmount(
    props.income_form.totalvalue - totalDiscount,
    totalAfterVat,
    totalExceptVat,
    props.income_form.vattype
  );

  props.income_form.discountvalue = totalDiscount;
  props.income_form.totalbeforevat = totalBeforeVat;
  props.income_form.totalvatvalue = totalVatValue;
  props.income_form.totalaftervat = totalAfterVat;
  props.income_form.totalexceptvat = totalExceptVat;
  props.income_form.totalamount = totalamount;
}

function getDocNo() {
  emit("getDocNo");
}

watch(
  () => [
    props.income_form.totalvalue,
    props.income_form.discount,
    props.income_form.vatrate,
    props.income_form.vattype,
  ],
  calculateTotal
);
</script>

<template>
  <form>
    <div class="grid formgrid p-fluid">
      <div class="field mb-4 col-12 md:col-3">
        <span class="p-float-label">
          <DatePicker
            dateFormat="d/m/yy"
            v-model="props.income_form.docdate"
            :modelValue="props.income_form.docdate"
            :class="props.income_form_valid.docdate ? 'p-invalid' : ''"
            :showIcon="true"
            :disabled="props.isUpdate"
            :buddhist="buddhistYear"
            :hideOnDateTimeSelect="true"
            :hiddenTime="true"
            @date-select="checkAccountPeriod($event)"
            @keyup.enter="headerNextFocus('docno')"
            @keydown.tab="headerNextFocus('docno')"
            inputClass="docdate"
          />
          <label for="docdate">เอกสารวันที่</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <div class="p-inputgroup">
          <InputText
            type="text"
            v-model="props.income_form.docno"
            :class="props.income_form_valid.docno ? 'p-invalid ' : ''"
            :disabled="props.isUpdate || update_mode"
            @keyup.enter="headerNextFocus('exdocrefdate')"
            @keydown.tab="headerNextFocus('exdocrefdate')"
            class="docno"
          />
          <Button
            icon="pi pi-refresh"
            @click="getDocNo()"
            class="p-button-primary"
          />
        </div>
        <!-- <span class="p-float-label">
          <InputText
            type="text"
            v-model="props.income_form.docno"
            :class="props.income_form_valid.docno ? 'p-invalid ' : ''"
            :disabled="props.isUpdate || update_mode"
            @keyup.enter="headerNextFocus('exdocrefdate')"
            @keydown.tab="headerNextFocus('exdocrefdate')"
            class="docno"
          />
          <label for="docNo">เลขที่เอกสาร</label>
        </span> -->
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <span class="p-float-label">
          <DatePicker
            dateFormat="d/m/yy"
            v-model="props.income_form.exdocrefdate"
            :modelValue="props.income_form.exdocrefdate"
            :showIcon="true"
            :disabled="props.isUpdate"
            :buddhist="buddhistYear"
            :hideOnDateTimeSelect="true"
            :hiddenTime="true"
            inputClass="exdocrefdate"
            @date-select="headerNextFocus('exdocrefno')"
            @keyup.enter="headerNextFocus('exdocrefno')"
            @keydown.tab="headerNextFocus('exdocrefno')"
          />
          <label for="exdocrefdate">เอกสารวันที่อ้างอิง</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <span class="p-float-label">
          <InputText
            id="exdocrefno"
            type="text"
            v-model="props.income_form.exdocrefno"
            :disabled="props.isUpdate || update_mode"
            @keyup.enter="headerNextFocus('debtor')"
            @keydown.tab="headerNextFocus('debtor')"
            class="exdocrefno"
          />
          <label for="exdocrefno">เลขที่เอกสารอ้างอิง</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-6">
        <span class="p-float-label">
          <Dropdown
            v-model="props.income_form.debtorcode"
            :options="props.customer_detail"
            :class="props.income_form_valid.debtorcode ? 'p-invalid' : ''"
            :disabled="props.isUpdate"
            :filter="true"
            :filterFields="['code', 'name']"
            optionValue="code"
            optionLabel="name"
            filterPlaceholder="ค้นหา"
            placeholder="เลือก"
            :autoFilterFocus="true"
            @keyup.enter="headerNextFocus('vatttype')"
            @keydown.tab="headerNextFocus('vatttype')"
            inputClass="debtor"
            inputStyle="height: 51px;"
          >
            <template #option="slotProps">
              <div>
                {{ slotProps.option.code }} ~ {{ slotProps.option.name }}
              </div>
            </template>
          </Dropdown>
          <label for="debtor">ลูกหนี้</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <span class="p-float-label">
          <Dropdown
            v-model="props.income_form.vattype"
            :options="vatTypeList"
            :class="props.income_form_valid.vattype ? 'p-invalid' : ''"
            :disabled="props.isUpdate"
            :filter="false"
            :filterFields="['code', 'name']"
            optionValue="code"
            optionLabel="name"
            filterPlaceholder="ค้นหา"
            placeholder="เลือก"
            :autoFilterFocus="true"
            @keydown.tab="headerNextFocus('inquirytype')"
            @change="headerNextFocus('inquirytype')"
            inputClass="vatttype"
            inputStyle="height: 51px;"
          >
            <template #option="slotProps">
              <div>
                {{ slotProps.option.code }} ~ {{ slotProps.option.name }}
              </div>
            </template>
          </Dropdown>
          <label for="vatttype">ประเภทภาษี</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <span class="p-float-label">
          <Dropdown
            v-model="props.income_form.inquirytype"
            :options="inquiryTypeList"
            :class="props.income_form_valid.inquirytype ? 'p-invalid' : ''"
            :disabled="props.isUpdate"
            :filter="false"
            :filterFields="['code', 'name']"
            optionValue="code"
            optionLabel="name"
            filterPlaceholder="ค้นหา"
            placeholder="เลือก"
            :autoFilterFocus="true"
            @keydown.tab="headerNextFocus('accountdescription')"
            @change="headerNextFocus('accountdescription')"
            inputClass="inquirytype"
            inputStyle="height: 51px;"
          >
            <template #option="slotProps">
              <div>
                {{ slotProps.option.code }} ~ {{ slotProps.option.name }}
              </div>
            </template>
          </Dropdown>
          <label for="vatttype">ประเภทการขาย</label>
        </span>
      </div>
      <div class="field mb-12 col-12 md:col-12">
        <span class="p-float-label">
          <Textarea
            type="text"
            :disabled="props.isUpdate"
            v-model="props.income_form.accountdescription"
            @keydown.tab="headerNextFocus('accountRow1')"
            class="accountdescription"
            :autoResize="true"
            rows="2"
          />
          <label for="accountdescription">คำอธิบาย</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <label class="font-medium text-900">งวดบัญชี</label>
        <InputText
          type="number"
          :min="0"
          v-model="props.income_form.accountperiod"
          :disabled="true"
          class="accountperiod"
        />
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <label class="font-medium text-900">ปีบัญชี</label>
        <InputText
          type="number"
          :min="0"
          v-model="props.income_form.accountyear"
          :class="props.income_form_valid.accountyear ? 'p-invalid' : ''"
          :disabled="props.isUpdate"
          class="accountyear"
        />
      </div>
    </div>

    <div
      class="lg:flex-row gap-3 justify-content-between lg:align-items-center border-blue-500"
      style="border-top: 6px solid"
    >
      <div>
        <DataTable
          :value="props.income_form.incomedetail"
          :reorderableColumns="false"
          @rowReorder="onRowReorder"
          class="editable-cells-table"
          responsiveLayout="scroll"
        >
          <Column
            header="ย้าย"
            :rowReorder="true"
            style="width: 5%"
            v-if="!props.isUpdate"
          ></Column>
          <Column field="incomecode" header="รหัสรายได้" style="width: 15%">
            <template #body="{ data, field, index }" v-if="!props.isUpdate">
              <TextAutoComplete
                v-model="data[field]"
                :suggestions="filteredCountries"
                @complete="searchIncome($event)"
                :class="'incomecode' + index"
                :dropdown="false"
                optionLabel="incomecode"
                @item-select="selectIncome(data[field], field, index)"
                :inputClass="
                  props.income_form_valid.incomecode1 ? 'p-invalid' : ''
                "
              >
                <template #item="slotProps">
                  <div class="ml-2">
                    {{ slotProps.item.code }} ~
                    {{ slotProps.item.names[0].name }}
                  </div>
                </template>
              </TextAutoComplete>
            </template>
          </Column>
          <Column
            field="incomename"
            header="ชื่อรายได้"
            style="width: 15%"
            footerStyle="text-align: right !important"
          ></Column>
          <Column
            field="description"
            header="คำอธิบายรายการ"
            footerStyle="text-align: right !important"
            bodyStyle="text-align: right !important"
            headerStyle="text-align:center;width: 10%"
            style="width: 30%"
          >
            <template #body="{ data, field, index }">
              <template v-if="props.isUpdate">
                {{ data[field] }}
              </template>
              <template v-else>
                <InputText
                  :class="'description_' + index"
                  v-model="data[field]"
                  @enter="focusNext(field, index)"
                  @keyup.enter="focusNext(field, index)"
                  @keydow.tab="focusNext(field, index)"
                />
              </template>
            </template>
          </Column>
          <Column
            field="amount"
            header="จำนวนเงิน"
            footerStyle="text-align: right !important"
            bodyStyle="text-align: right !important"
            headerStyle="text-align:center;width: 10%"
            style="min-width: 180px"
          >
            <template #body="{ data, field, index }">
              <template v-if="props.isUpdate">
                {{ Utils.formatCurrency(data[field]) }}
              </template>
              <template v-else>
                <TextInputNumber
                  :class="'amount_' + index"
                  v-model="data[field]"
                  mode="decimal"
                  :maxFractionDigits="2"
                  @unfocus="sumTableAmount"
                  @enter="focusNext(field, index)"
                  inputStyle="text-align: right"
                />
              </template>
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
                @click="confirmDeleteDetail(slotProps.data, slotProps.index)"
              />
            </template>
          </Column>
          <Column
            header="เพิ่ม"
            bodyStyle="text-align:center"
            style="width: 5%"
            v-if="!props.isUpdate"
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

      <!-- ยอดรวมท้ายบิล -->
      <div>
        <div class="grid justify-content-end mt-5">
          <div class="field col-12 md:col-3">
            <label class="font-medium text-900">ส่วนลดท้ายบิล</label>
            <InputText
              type="text"
              v-model="props.income_form.discount"
              :disabled="props.isUpdate"
              style="text-align: right"
            />
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-medium text-900">มูลค่าส่วนลด</label>
            <TextInputNumber
              v-model="props.income_form.discountvalue"
              mode="decimal"
              :maxFractionDigits="2"
              :disabled="props.isUpdate"
              readonly
              inputStyle="text-align: right"
            />
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-medium text-900">อัตราภาษี %</label>
            <TextInputNumber
              v-model="props.income_form.vatrate"
              mode="decimal"
              :maxFractionDigits="2"
              :disabled="props.isUpdate"
              inputStyle="text-align: right"
            />
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-medium text-900">มูลค่า</label>
            <TextInputNumber
              v-model="props.income_form.totalvalue"
              mode="decimal"
              :maxFractionDigits="2"
              :disabled="props.isUpdate"
              readonly
              inputStyle="text-align: right"
            />
          </div>
        </div>
        <div class="grid justify-content-end">
          <div class="field col-12 md:col-3">
            <label class="font-medium text-900">ก่อนภาษี</label>
            <TextInputNumber
              v-model="props.income_form.totalbeforevat"
              mode="decimal"
              :maxFractionDigits="2"
              :disabled="props.isUpdate"
              readonly
              inputStyle="text-align: right"
            />
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-medium text-900">ภาษีมูลค่าเพิ่ม</label>
            <TextInputNumber
              v-model="props.income_form.totalvatvalue"
              mode="decimal"
              :maxFractionDigits="2"
              :disabled="props.isUpdate"
              readonly
              inputStyle="text-align: right"
            />
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-medium text-900">หลังภาษี</label>
            <TextInputNumber
              v-model="props.income_form.totalaftervat"
              mode="decimal"
              :maxFractionDigits="2"
              :disabled="props.isUpdate"
              readonly
              inputStyle="text-align: right"
            />
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-medium text-900">รวมเงิน</label>
            <TextInputNumber
              v-model="props.income_form.totalamount"
              mode="decimal"
              :maxFractionDigits="2"
              :disabled="props.isUpdate"
              readonly
              inputStyle="text-align: right"
            />
          </div>
        </div>
        <div class="grid justify-content-end hidden">
          <div class="field col-12 md:col-3">
            <label class="font-medium text-900">ยกเว้นภาษี</label>
            <InputText
              type="text"
              v-model="props.income_form.totalexceptvat"
              :disabled="props.isUpdate"
            />
          </div>
        </div>
      </div>

      <!-- ชำระเงิน -->
      <div
        class="flex w-full relative align-items-center justify-content-center my-3 px-4"
      >
        <div
          class="border-top-1 surface-border top-50 left-0 absolute w-full"
        ></div>
        <div class="px-2 z-1 surface-0 flex align-items-center">
          <span class="text-900 font-medium">รายละเอียดการรับเงิน</span>
        </div>
      </div>
      <div class="grid justify-content-end">
        <div class="field col-6 md:col-6">
          <label class="font-medium text-900">ประเภทการชำระ</label>
          <Dropdown
            v-model="props.income_form.payment.paymenttype"
            :options="paymenttypeList"
            :class="props.income_form_valid.paymenttype ? 'p-invalid' : ''"
            :disabled="props.isUpdate"
            :filter="false"
            optionValue="code"
            optionLabel="name"
            filterPlaceholder="ค้นหา"
            placeholder="เลือก"
            inputStyle="height: 51px;"
          />
        </div>
        <div class="field col-6 md:6">
          <label class="font-medium text-900">จำนวนเงิน</label>
          <TextInputNumber
            v-model="props.income_form.payment.paymentamount"
            mode="decimal"
            :maxFractionDigits="2"
            :disabled="props.isUpdate"
            inputStyle="text-align: right"
            :inputClass="
              props.income_form_valid.paymentamount ? 'p-invalid' : ''
            "
          />
        </div>
      </div>
    </div>
  </form>

  <Dialog
    v-model:visible="deleteDetailDialog"
    :style="{ width: '450px' }"
    header="ยืนยันการลบ"
    :modal="true"
  >
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span
        >ต้องการลบรายการ <b>{{ detail.incomename }}</b> ใช่หรือไม่</span
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

  <DialogWarringPeriod
    :confirmDialog="warringAccountperiod"
    v-on:confirm="warringAccountperiod = false"
  />
</template>

<style scoped>
.p-dialog.p-component.p-ripple-disabled {
  background-color: #fff;
}
</style>
