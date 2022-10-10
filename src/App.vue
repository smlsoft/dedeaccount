<script setup>
import { RouterLink, RouterView } from "vue-router";
import HelloWorld from "@/components/HelloWorld.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import { onMounted } from "vue";
import { usePrimeVue } from "primevue/config";

const primevue = usePrimeVue();
onMounted(() => {
  document.title = "Village Fund GL";

  if (process.env.VUE_APP_DATE == "th") {
    primevue.config.locale.dayNames = [
      "วันอาทิตย์",
      "วันจันทร์",
      "วันอังคาร",
      "วันพุธ",
      "วันพฤหัสบดี",
      "วันศุกร์",
      "วันเสาร์",
    ];
    primevue.config.locale.dayNamesShort = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
    primevue.config.locale.dayNamesMin = [
      "อา",
      "จ",
      "อ",
      "พ",
      "พฤ",
      "ศ",
      "ส",
    ];
    primevue.config.locale.monthNames = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    primevue.config.locale.monthNamesShort = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    primevue.config.locale.today = 'วันนี้'
    primevue.config.locale.dateFormat = 'dd/mm/yy'
  }
});
</script>

<template>
  <RouterView />
</template>

<style lang="scss">
@import "./assets/styles/app.scss";
</style>
