<script setup>
import { ref, onUpdated, onMounted } from "vue";
import $ from "jquery";
import Dropdown from "primevue/dropdown";
import district from "@/assets/thai_province_data/thai_amphures.json";
import provinces from "@/assets/thai_province_data/thai_provinces.json";
import subdistrict from "@/assets/thai_province_data/thai_tambons.json";

const props = defineProps({
  form_model: Object,
  form_valid: Object,
  debtorCodeFocus: Boolean,
  readMode: Boolean,
});

const emit = defineEmits(["unFocusDebtorCode", "onSave"]);

onMounted(() => {});

onUpdated(() => {
  // console.log(props);
  if (props.debtorFocus) {
    $(".debtorCodeFocus").focus();
  }
});

function onSave() {
  emit("onSave");
}

function unFocusDebtorCode() {
  emit("unFocusDebtorCode");
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

///update radioType
function updatePersonalType(type) {
  this.props.form_model.personaltype = type;
  return this.props.form_model.personaltype;
}
function updateCustomertype(type) {
  this.props.form_model.customertype = type;
  return this.props.form_model.customertype;
}

/// ThaiProvinces
const provincedata = ref({
  provinces: [],
  district: [],
  subdistrict: [],
  filteredDistricts: [],
  filteredSubdistricts: [],
  filteredZipcode: [],
});

provincedata.value.provinces = provinces.map((province) => ({
  name: province.name_th,
  id: province.id,
}));
provincedata.value.district = district.map((district) => ({
  name: district.name_th,
  id: district.id,
  id_provice: district.province_id,
}));
provincedata.value.subdistrict = subdistrict.map((subdistrict) => ({
  name: subdistrict.name_th,
  id_subdistrict: subdistrict.id,
  zipcode: subdistrict.zip_code,
  id_amphure: subdistrict.amphure_id,
}));

const searchDistrict = async (id) => {
  id = id.value.id;
  provincedata.value.filteredDistricts = provincedata.value.district
    .filter((district) => district.id_provice === id)
    .map((filteredDistrict) => ({
      id: filteredDistrict.id,
      name: filteredDistrict.name,
      id_provice: filteredDistrict.id_provice,
    }));
  // console.log(provincedata.value.filteredDistricts);
  return provincedata.value.filteredDistricts;
};

const searchSubdistricts = async (id) => {
  id = id.value.id;
  provincedata.value.filteredSubdistricts = provincedata.value.subdistrict
    .filter((subdistrict) => subdistrict.id_amphure === id)
    .map((filteredSubdistricts) => ({
      id_subdistrict: filteredSubdistricts.id_subdistrict,
      name: filteredSubdistricts.name,
      id_amphure: filteredSubdistricts.id_amphure,
      zip_code: filteredSubdistricts.zipcode,
    }));
  // console.log( provincedata.value.filteredSubdistricts);
  return provincedata.value.filteredSubdistricts;
};

const searchZipcode = async (id) => {
  id = id.value.id_subdistrict;
  provincedata.value.filteredZipcode = provincedata.value.subdistrict
    .filter((subdistrict) => subdistrict.id_subdistrict === id)
    .map((filteredZipcodes) => ({
      zip_code: filteredZipcodes.zipcode.toString(), // Convert zip code to string
    }));
  // console.log( provincedata.value.filteredZipcode);
  return provincedata.value.filteredZipcode;
};
</script>

<template>
  <div class="p-2">
    <Button
      :disabled="readMode"
      @click="onSave"
      label="บันทึกลูกหนี้"
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
            @blur="unFocusDebtorCode"
            @keyup.enter="headerNextFocus('name')"
          />
          <label>รหัสลูกหนี้</label>
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
          <label>ชื่อลูกหนี้</label>
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

      <div class="field col-12 md:col-6">
        <Dropdown
          :disabled="readMode"
          v-model="props.form_model.province"
          :options="provincedata.provinces"
          optionLabel="name"
          placeholder="จังหวัด"
          @change="searchDistrict"
        />
      </div>

      <div class="field col-12 md:col-6">
        <Dropdown
          :disabled="readMode"
          v-model="props.form_model.district"
          :options="provincedata.filteredDistricts"
          optionLabel="name"
          placeholder="อำเภอ"
          @change="searchSubdistricts"
        />
      </div>

      <div class="field col-12 md:col-6">
        <Dropdown
          :disabled="readMode"
          v-model="props.form_model.subdistrict"
          :options="provincedata.filteredSubdistricts"
          optionLabel="name"
          placeholder="ตำบล"
          @change="searchZipcode"
        />
      </div>

      <div class="field col-12 md:col-6">
        <Dropdown
          :disabled="readMode"
          v-model="props.form_model.zipcode"
          :options="provincedata.filteredZipcode"
          optionLabel="zip_code"
          placeholder="รหัสไปรษณีย์"
        />
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
