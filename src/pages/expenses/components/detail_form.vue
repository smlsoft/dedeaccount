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

// Create an instance of BillingCalculator
const calculator = new BillingCalculator();

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

const props = defineProps({
  expenses_form: Object,
  expenses_form_valid: Object,
  isUpdate: Boolean,
  expenses_detail: Array,
  accountBook_detail: Array,
  groupAccount_detail: Array,
  customer_detail: Array,
  id: String,
});

const emit = defineEmits([
  "ImportDaliy",
  "deleteDetail",
  "addColumn",
  "onRowReorder",
  "selectexpenses",
  "setAccountPeriod",
]);

const sumTableAmount = computed({
  get() {
    let sum = 0;
    props.expenses_form.expensesdetail.forEach((ele) => {
      if (ele.amount == null) {
        ele.amount = 0.0;
      }
      sum += parseFloat(ele.amount);
      props.expenses_form.totalvalue = sum;
    });
    return sum.toFixed(2);
  },
});

onMounted(async () => {
  checkAccountPeriod(props.expenses_form.docdate);
});

function selectexpenses(data, field, index) {
  emit("selectexpenses", data, index);
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

function searchexpenses(event) {
  setTimeout(() => {
    if (!event.query.trim().length) {
      filteredCountries.value = props.expenses_detail;
    } else {
      filteredCountries.value = props.expenses_detail.filter((expenses) => {
        if (
          expenses.code.toLowerCase().includes(event.query.toLowerCase()) ||
          expenses.names[0].name
            .toLowerCase()
            .includes(event.query.toLowerCase())
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
    if (field === "expensescode") {
      $(`.description_${index}`).focus();
    } else if (field === "description") {
      $(`.amount_${index} > input`).focus();
    } else if (field === "amount") {
      addColumn(index);
      setTimeout(() => {
        if (props.expenses_form.expensesdetail.length > index + 1) {
          $(`.expensescode${index + 1} > input`).focus();
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
      bookcode: ".bookcode",
      vatttype: ".vatttype",
      inquirytype: ".inquirytype",
      accountdescription: ".accountdescription",
    };
    $(fieldMap[filedName]).focus();
  }, 100);
}

function calculateTotal() {
  props.expenses_form.discountvalue = 0;
  props.expenses_form.totalbeforevat = 0;
  props.expenses_form.totalvatvalue = 0;

  const totalDiscount = calculator.calculateTotalDiscount(
    props.expenses_form.totalvalue,
    props.expenses_form.discount
  );
  const totalBeforeVat = calculator.calculateTotalBeforeVat(
    props.expenses_form.totalvalue - totalDiscount,
    props.expenses_form.vatrate,
    props.expenses_form.vattype,
    props.expenses_form.discount
  );
  const totalVatValue = calculator.calculateTotalVatValue(
    props.expenses_form.totalvalue - totalDiscount,
    totalBeforeVat,
    props.expenses_form.vatrate,
    props.expenses_form.vattype
  );

  const totalAfterVat = calculator.calculateTotalAfterVat(
    totalBeforeVat,
    totalVatValue
  );

  const totalExceptVat = calculator.calculateTotalExceptVat();

  const totalamount = calculator.calculateTotalAmount(
    props.expenses_form.totalvalue - totalDiscount,
    totalAfterVat,
    totalExceptVat,
    props.expenses_form.vattype
  );

  props.expenses_form.discountvalue = totalDiscount;
  props.expenses_form.totalbeforevat = totalBeforeVat;
  props.expenses_form.totalvatvalue = totalVatValue;
  props.expenses_form.totalaftervat = totalAfterVat;
  props.expenses_form.totalexceptvat = totalExceptVat;
  props.expenses_form.totalamount = totalamount;
}

watch(
  () => [
    props.expenses_form.totalvalue,
    props.expenses_form.discount,
    props.expenses_form.vatrate,
    props.expenses_form.vattype,
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
            v-model="props.expenses_form.docdate"
            :modelValue="props.expenses_form.docdate"
            :class="props.expenses_form_valid.docdate ? 'p-invalid' : ''"
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
        <span class="p-float-label">
          <InputText
            type="text"
            v-model="props.expenses_form.docno"
            :class="props.expenses_form_valid.docno ? 'p-invalid ' : ''"
            :disabled="props.isUpdate || update_mode"
            @keyup.enter="headerNextFocus('exdocrefdate')"
            @keydown.tab="headerNextFocus('exdocrefdate')"
            class="docno"
          />
          <label for="docNo">เลขที่เอกสาร</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <span class="p-float-label">
          <DatePicker
            dateFormat="d/m/yy"
            v-model="props.expenses_form.exdocrefdate"
            :modelValue="props.expenses_form.exdocrefdate"
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
            v-model="props.expenses_form.exdocrefno"
            :disabled="props.isUpdate || update_mode"
            @keyup.enter="headerNextFocus('debtor')"
            @keydown.tab="headerNextFocus('debtor')"
            class="exdocrefno"
          />
          <label for="exdocrefno">เลขที่เอกสารอ้างอิง</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <span class="p-float-label">
          <Dropdown
            v-model="props.expenses_form.creditorcode"
            :options="props.customer_detail"
            :class="props.expenses_form_valid.creditorcode ? 'p-invalid' : ''"
            :disabled="props.isUpdate"
            :filter="true"
            :filterFields="['code', 'name']"
            optionValue="code"
            optionLabel="name"
            filterPlaceholder="ค้นหา"
            placeholder="เลือก"
            :autoFilterFocus="true"
            @keyup.enter="headerNextFocus('bookcode')"
            @keydown.tab="headerNextFocus('bookcode')"
            inputClass="debtor"
            inputStyle="height: 51px;"
          >
            <template #option="slotProps">
              <div>
                {{ slotProps.option.code }} ~ {{ slotProps.option.name }}
              </div>
            </template>
          </Dropdown>
          <label for="debtor">เจ้าหนี้</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <span class="p-float-label">
          <Dropdown
            v-model="props.expenses_form.bookcode"
            :options="props.accountBook_detail"
            :class="props.expenses_form_valid.bookcode ? 'p-invalid' : ''"
            :disabled="props.isUpdate"
            :filter="true"
            :filterFields="['code', 'name1']"
            optionValue="code"
            optionLabel="label"
            filterPlaceholder="ค้นหา"
            placeholder="เลือก"
            :autoFilterFocus="true"
            @keyup.enter="headerNextFocus('vatttype')"
            @keydown.tab="headerNextFocus('vatttype')"
            inputClass="bookcode"
            inputStyle="height: 51px;"
          >
            <template #option="slotProps">
              <div>
                {{ slotProps.option.code }} ~ {{ slotProps.option.name1 }}
              </div>
            </template>
          </Dropdown>
          <label for="bookcode">สมุดรายวัน</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <span class="p-float-label">
          <Dropdown
            v-model="props.expenses_form.vattype"
            :options="vatTypeList"
            :class="props.expenses_form_valid.vattype ? 'p-invalid' : ''"
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
            v-model="props.expenses_form.inquirytype"
            :options="inquiryTypeList"
            :class="props.expenses_form_valid.inquirytype ? 'p-invalid' : ''"
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
            v-model="props.expenses_form.accountdescription"
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
          v-model="props.expenses_form.accountperiod"
          :disabled="true"
          class="accountperiod"
        />
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <label class="font-medium text-900">ปีบัญชี</label>
        <InputText
          type="number"
          :min="0"
          v-model="props.expenses_form.accountyear"
          :class="props.expenses_form_valid.accountyear ? 'p-invalid' : ''"
          :disabled="props.isUpdate"
          class="accountyear"
        />
      </div>
      <div class="surface-border border-top-1 opacity-50 col-12 mt-5"></div>
    </div>

    <div>
      <DataTable
        :value="props.expenses_form.expensesdetail"
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
        <Column field="expensescode" header="รหัสค่าใช้จ่าย" style="width: 15%">
          <template #body="{ data, field, index }" v-if="!props.isUpdate">
            <TextAutoComplete
              v-model="data[field]"
              :suggestions="filteredCountries"
              @complete="searchexpenses($event)"
              :class="'expensescode' + index"
              :dropdown="false"
              optionLabel="expensescode"
              @item-select="selectexpenses(data[field], field, index)"
              :inputClass="
                props.expenses_form_valid.expensescode1 ? 'p-invalid' : ''
              "
            >
              <template #item="slotProps">
                <div class="ml-2">
                  {{ slotProps.item.code }} ~ {{ slotProps.item.names[0].name }}
                </div>
              </template>
            </TextAutoComplete>
          </template>
        </Column>
        <Column
          field="expensesname"
          header="ชื่อค่าใช้จ่าย"
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
            v-model="props.expenses_form.discount"
            :disabled="props.isUpdate"
            style="text-align: right"
          />
        </div>
        <div class="field col-12 md:col-3">
          <label class="font-medium text-900">มูลค่าส่วนลด</label>
          <TextInputNumber
            v-model="props.expenses_form.discountvalue"
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
            v-model="props.expenses_form.vatrate"
            mode="decimal"
            :maxFractionDigits="2"
            :disabled="props.isUpdate"
            inputStyle="text-align: right"
          />
        </div>
        <div class="field col-12 md:col-3">
          <label class="font-medium text-900">มูลค่า</label>
          <TextInputNumber
            v-model="props.expenses_form.totalvalue"
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
            v-model="props.expenses_form.totalbeforevat"
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
            v-model="props.expenses_form.totalvatvalue"
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
            v-model="props.expenses_form.totalaftervat"
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
            v-model="props.expenses_form.totalamount"
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
            v-model="props.expenses_form.totalexceptvat"
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
          v-model="props.expenses_form.payment.paymenttype"
          :options="paymenttypeList"
          :class="props.expenses_form_valid.paymenttype ? 'p-invalid' : ''"
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
          v-model="props.expenses_form.payment.paymentamount"
          mode="decimal"
          :maxFractionDigits="2"
          :disabled="props.isUpdate"
          inputStyle="text-align: right"
          :inputClass="
            props.expenses_form_valid.paymentamount ? 'p-invalid' : ''
          "
        />
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
        >ต้องการลบรายการ <b>{{ detail.expensesname }}</b> ใช่หรือไม่</span
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
