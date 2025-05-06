<template>
  <Dialog
    v-model:visible="dialogVisible"
    :breakpoints="{ '960px': '90vw', '640px': '100vw' }"
    :style="{ width: '50vw' }"
  >
    <template #header>
      <h3>
        {{ daily_form.docno }}
        <i
          v-if="allowEdit"
          class="pi pi-pencil text-yellow-500 hover:text-blue-500 cursor-pointer"
          @click="goDetail(daily_form.guidfixed)"
        ></i>
      </h3>
    </template>
    <div class="confirmation-content" id="boxconfirm" style="height: 70vh">
      <TabView class="tabview-custom" ref="tabview">
        <TabPanel>
          <template #header>
            <i class="pi pi-book mr-1"></i>
            <span>{{ $t("journal") }}</span>
          </template>
          <JournalForm
            :isUpdate="readMode"
            :daily_form="daily_form"
            :daily_form_valid="daily_form_valid"
            :income_expenses_mode="true"
          >
          </JournalForm>
        </TabPanel>
        <TabPanel>
          <template #header>
            <i class="pi pi-wallet mr-1"></i>
            <span>{{ $t("vat") }}</span>
          </template>
          <VatForm
            :isUpdate="readMode"
            :vats="vats"
            :vats_valid="vats_valid"
          ></VatForm>
        </TabPanel>
        <TabPanel>
          <template #header>
            <i class="pi pi-wallet mr-1"></i>
            <span>{{ $t("taxes") }}</span>
          </template>
          <TaxForm
            :isUpdate="readMode"
            :taxes="taxes"
            :taxes_valid="taxes_valid"
          ></TaxForm>
        </TabPanel>
        <TabPanel v-if="showTabImage">
          <template #header>
            <i class="pi pi-image mr-1"></i>
            <span>{{ $t("img") }}</span>
          </template>
          <Galleria
            :value="dataImage"
            :showThumbnails="false"
            :circular="true"
            :showIndicators="dataImage.length > 1"
            containerStyle="max-width: 100%"
          >
            <template #item="slotProps">
              <div class="grid w-full">
                <div class="col-12">
                  <div
                    class="flex justify-content-between flex-wrap card-container purple-container"
                  >
                    <Chip
                      :label="slotProps.item.name"
                      icon="pi pi-image"
                      class="mt-2"
                    />
                    <Chip
                      :label="
                        'วันที่ : ' +
                        utils.getDateTimeFormat(slotProps.item.uploadedat)
                      "
                      icon="pi pi-calendar"
                      class="mr-2 mt-2"
                    />
                  </div>
                </div>
                <div class="col-12">
                  <div
                    class="relative"
                    style="
                      margin: 0px;
                      padding: 0px;
                      width: 100%;
                      height: 63vh;
                    "
                  >
                    <iframe
                      :name="slotProps.item.imageuri"
                      :src="
                        '/images/components/zoom?uri=' +
                        slotProps.item.imageuri
                      "
                      class="static"
                    >
                    </iframe>
                  </div>
                </div>
              </div>
            </template>
          </Galleria>
        </TabPanel>
      </TabView>
    </div>
  </Dialog>
</template>

<script setup>
/* eslint-disable */
import { ref, defineProps, defineEmits, watchEffect, watch } from "vue";
import JournalForm from "@/pages/daily/components/journal_form.vue";
import VatForm from "@/pages/daily/components/vat_form.vue";
import TaxForm from "@/pages/daily/components/tax_form.vue";
import ImageDataService from "@/services/ImageDataService";
import MasterdataService from "@/services/MasterdataService";
import { useToast } from "primevue/usetoast";
import router from "@/router";
import utils from "@/utils";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  docno: {
    type: String,
    default: ''
  },
  allowEdit: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:visible']);

const toast = useToast();
const dialogVisible = ref(false);
const daily_form = ref({
  accountdescription: '',
  accountgroup: '',
  accountperiod: '',
  accountyear: '',
  amount: 0,
  batchId: '',
  docdate: '',
  docno: '',
  bookcode: '',
  accountcode1: '',
  guidfixed: '',
  journaltype: '',
  journaldetail: [],
  exdocrefdate: '',
  exdocrefno: ''
});

const daily_form_valid = ref({
  accountdescription: false,
  accountgroup: false,
  accountperiod: false,
  accountyear: false,
  amount: false,
  batchId: false,
  docdate: false,
  docno: false,
  bookcode: false,
  accountcode1: false,
});

const readMode = ref(true);
const vats = ref([]);
const taxes = ref([]);
const vats_valid = ref([]);
const taxes_valid = ref([]);
const dataImage = ref([]);
const showTabImage = ref(false);

// เมื่อค่า props.visible เปลี่ยน ให้อัพเดท dialogVisible
watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue;
});

// เมื่อค่า dialogVisible เปลี่ยน ให้ emit event เพื่ออัพเดท props.visible
watch(dialogVisible, (newValue) => {
  emit('update:visible', newValue);
});

// เมื่อมี docno ใหม่และ dialog เปิดอยู่ ให้โหลดข้อมูล
watchEffect(() => {
  if (props.docno && dialogVisible.value) {
    loadDocumentDetail(props.docno);
  }
});

// โหลดข้อมูลรายละเอียดเอกสาร
function loadDocumentDetail(docno) {
  MasterdataService.getGLledger(docno)
    .then((res) => {
      if (res.success) {
        console.log('Document detail loaded:', res);
        getDocumentImageByDocNo(docno);

        const vat = res.data.vats;
        const tax = res.data.taxes;

        daily_form.value.guidfixed = res.data.guidfixed;
        daily_form.value.accountdescription = res.data.accountdescription;
        daily_form.value.accountgroup = res.data.accountgroup;
        daily_form.value.accountperiod = res.data.accountperiod;
        daily_form.value.accountyear = res.data.accountyear;
        daily_form.value.amount = res.data.amount;
        daily_form.value.batchId = res.data.batchId;
        daily_form.value.journaltype = res.data.journaltype.toString();
        daily_form.value.docdate = utils.getDateTimeFromDate(res.data.docdate);
        daily_form.value.docno = res.data.docno;
        daily_form.value.bookcode = res.data.bookcode;
        daily_form.value.journaldetail = res.data.journaldetail;
        
        if (res.data.exdocrefdate === "0001-01-01T00:00:00Z") {
          daily_form.value.exdocrefdate = "";
        } else {
          daily_form.value.exdocrefdate = utils.getDateTimeFromDate(res.data.exdocrefdate);
        }
        
        daily_form.value.exdocrefno = res.data.exdocrefno;

        // จัดการข้อมูล VAT
        if (vat && vat.length > 0) {
          vats.value = [];
          vats_valid.value = [];

          for (let i = 0; i < vat.length; i++) {
            const vattemp = {
              vattype: vat[i].vattype,
              vatdate: utils.getDateTimeFromDate(vat[i].vatdate),
              vatdocno: vat[i].vatdocno,
              vatperiod: vat[i].vatperiod,
              vatyear: vat[i].vatyear,
              vatbase: vat[i].vatbase,
              vatrate: vat[i].vatrate,
              vatamount: vat[i].vatamount,
              exceptvat: vat[i].exceptvat,
              vatmode: vat[i].vatmode,
              vatsubmit: vat[i].vatsubmit,
              custname: vat[i].custname,
              custtaxid: vat[i].custtaxid,
              organization: vat[i].organization,
              branchcode: vat[i].branchcode,
              remark: vat[i].remark,
            };
            
            putVatValid();
            vats.value.push(vattemp);
          }
        }

        // จัดการข้อมูลภาษีหัก ณ ที่จ่าย
        if (tax && tax.length > 0) {
          taxes.value = [];
          taxes_valid.value = [];
          
          for (let i = 0; i < tax.length; i++) {
            const taxes_temp = {
              taxdocno: tax[i].taxdocno,
              taxdate: utils.getDateTimeFromDate(tax[i].taxdate),
              custname: tax[i].custname,
              custtype: tax[i].custtype,
              custtaxid: tax[i].custtaxid,
              taxtype: tax[i].taxtype,
              address: tax[i].address,
              details: [],
            };

            if (tax[i].details && tax[i].details.length > 0) {
              tax[i].details.forEach((data) => {
                const details_temp = {
                  description: data.description,
                  taxbase: data.taxbase,
                  taxrate: data.taxrate,
                  taxamount: data.taxamount,
                };

                taxes_temp.details.push(details_temp);
              });
            } else {
              taxes_temp.details = [
                {
                  description: "",
                  taxbase: 0,
                  taxrate: 0,
                  taxamount: 0,
                },
              ];
            }
            
            putTaxValid();
            taxes.value.push(taxes_temp);
          }
        }
      }
    })
    .catch((err) => {
      console.error("Error loading document detail:", err);
      dialogVisible.value = false;
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ไม่สามารถดึงข้อมูล " + docno + " ได้ " + err,
        life: 3000,
      });
    });
}

// โหลดรูปภาพของเอกสาร
function getDocumentImageByDocNo(docno) {
  ImageDataService.getDocumentImageByDocNo(docno)
    .then((res) => {
      if (res.success) {
        showTabImage.value = true;
        setTimeout(() => {
          dataImage.value = res.data.imagereferences;
        }, 1000);
      }
    })
    .catch((err) => {
      console.log(err + " : ไม่เจอรูป");
      showTabImage.value = false;
    });
}

// เพิ่ม validation สำหรับ VAT
function putVatValid() {
  vats_valid.value.push({
    vatdate: false,
    vatdocno: false,
    vatperiod: false,
    vatyear: false,
    vatbase: false,
    vatrate: false,
    vatamount: false,
    exceptvat: false,
    custname: false,
    custtaxid: false,
    branchcode: false,
  });
}

// เพิ่ม validation สำหรับภาษีหัก ณ ที่จ่าย
function putTaxValid() {
  taxes_valid.value.push({
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  });
}

// ไปยังหน้าแก้ไขเอกสาร
function goDetail(id) {
  router.push({
    name: "dailyUpdate",
    params: { id: id, mode: "edit" },
  });
}
</script>

<style scoped>
iframe {
  display: block; /* iframes are inline by default */
  background: #000;
  border: none; /* Reset default border */
  height: 100%; /* Viewport-relative units */
  width: 100%;
}
</style>