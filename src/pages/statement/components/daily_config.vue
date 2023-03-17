<script setup>
import Utils from "@/utils/";
import MasterdataService from "@/services/MasterdataService";
import DatePicker from "@/components/widget/DatePicker.vue";
import TextAutoComplete from "@/components/widget/TextAutoComplete.vue";
import { ref, onMounted, onUnmounted, computed } from "vue";

onMounted(() => {
  getAccountChart();
  getJournalBook();
});


const accountBook_detail = ref([]);
const accountChart_detail = ref([]);
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const filteredCountries = ref();

const props = defineProps({
  daily_config: Object,
  daily_config_valid: Object,
});

const emit = defineEmits([]);

function getJournalBook() {
  MasterdataService.getJournalBook()
    .then((res) => {
      //console.log(res);
      if (res.success) {
        accountBook_detail.value = res.data.sort(function (obj1, obj2) {
          return obj1.code - obj2.code;
        });
        accountBook_detail.value.forEach((ele) => {
          ele.label = ele.code + "~" + ele.name1;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function getAccountChart() {
  MasterdataService.getAccountChart()
    .then((res) => {
      //   console.log(res);
      if (res.success) {
        accountChart_detail.value = res.data.sort(function (obj1, obj2) {
          return obj1.accountcode - obj2.accountcode;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function searchAccount(event) {
  setTimeout(() => {
    // console.log(event.query);
    if (!event.query.trim().length) {
      filteredCountries.value = accountChart_detail.value;
    } else {
      filteredCountries.value = accountChart_detail.value.filter((account) => {
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

const labelTextPassbook = ref("");
const labelTextReversal = ref("");

function setTextOtionPassbook(event) {
  labelTextPassbook.value =
    event.value.accountcode + " ~ " + event.value.accountname;
}

function returnTextPassbook() {
  return labelTextPassbook.value;
}

function setTextOtionReversal(event) {
  labelTextReversal.value =
    event.value.accountcode + " ~ " + event.value.accountname;
}

function returnTexReversal() {
  return labelTextReversal.value;
}
</script>

<template>
  <div class="grid formgrid p-fluid p-3">
    <div class="field mb-4 col-12 md:col-4">
      <span class="p-float-label">
        <Dropdown
          v-model="props.daily_config.bookcode"
          :options="accountBook_detail"
          :class="props.daily_config_valid.bookcode ? 'p-invalid' : ''"
          :filter="true"
          :filterFields="['code', 'name1']"
          optionValue="code"
          optionLabel="label"
          filterPlaceholder="ค้นหา"
          placeholder="เลือก"
          :autoFilterFocus="true"
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
        <DatePicker
          dateFormat="d/m/yy"
          v-model="props.daily_config.exdocrefdate"
          :modelValue="props.daily_config.exdocrefdate"
          :showIcon="true"
          :buddhist="buddhistYear"
          :hideOnDateTimeSelect="true"
          :hiddenTime="true"
        />
        <label for="exdocrefdate">เอกสารวันที่อ้างอิง</label>
      </span>
    </div>
    <div class="field mb-4 col-12 md:col-5">
      <span class="p-float-label">
        <InputText
          id="exdocrefno"
          type="text"
          v-model="props.daily_config.exdocrefno"
        />
        <label for="exdocrefno">เลขที่เอกสารอ้างอิง</label>
      </span>
    </div>
    <div class="field mb-4 col-12 md:col-6">
      <span class="p-float-label">
        <TextAutoComplete
          v-model="props.daily_config.accountpassbook"
          :suggestions="filteredCountries"
          @complete="searchAccount($event)"
          :optionLabel="returnTextPassbook"
          :dropdown="false"
          :inputClass="
            props.daily_config_valid.accountpassbook ? 'p-invalid' : ''
          "
          :forceSelection="true"
          @item-select="setTextOtionPassbook($event)"
        >
          <template #item="slotProps">
            <div class="ml-2">
              {{ slotProps.item.accountcode }} ~
              {{ slotProps.item.accountname }}
            </div>
          </template>
        </TextAutoComplete>
        <label for="bookcode">ผังบัญชีสมุดเงินฝาก</label>
      </span>
    </div>
    <div class="field mb-4 col-12 md:col-6">
      <span class="p-float-label">
        <TextAutoComplete
          v-model="props.daily_config.reversal"
          :suggestions="filteredCountries"
          @complete="searchAccount($event)"
          :optionLabel="returnTexReversal"
          :dropdown="false"
          :inputClass="props.daily_config_valid.reversal ? 'p-invalid' : ''"
          :forceSelection="true"
          @item-select="setTextOtionReversal($event)"
        >
          <template #item="slotProps">
            <div class="ml-2">
              {{ slotProps.item.accountcode }} ~
              {{ slotProps.item.accountname }}
            </div>
          </template>
        </TextAutoComplete>
        <label for="bookcode">ผังบัญชีกลับรายการ</label>
      </span>
    </div>
  </div>
</template>
