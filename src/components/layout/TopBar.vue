<script setup>
import { useApp } from "@/stores/app.js";
const storeApp = useApp();
const shopName = localStorage.shop_name;

const emit = defineEmits(["openSelectShop"]);

function openSelectShop() {
  emit("openSelectShop");
}

</script>

<template>
  <div
    class="flex justify-content-between align-items-center px-2 relative lg:static sm:h-4rem lg:h-2rem"
    style="
      background: linear-gradient(90deg, #025A86 35.86%, rgb(77 153 168) 97.37%);
    "
  >
    <div class="flex align-items-center justify-content-center">
      <a
        v-ripple
        class="cursor-pointer block lg:hidden text-700 mr-3 mt-1 p-ripple"
        v-styleclass="{
          selector: '#app-sidebar',
          enterClass: 'hidden',
          enterActiveClass: 'fadeinleft',
          leaveToClass: 'hidden',
          leaveActiveClass: 'fadeoutleft',
          hideOnOutsideClick: true,
        }"
      >
        <i class="pi pi-bars text-4xl"></i>
      </a>
      <div class="font-medium text-1xl text-white">
        {{ storeApp.PageTitle }}
      </div>
    </div>
    <div
      class="font-medium text-1xl text-right text-white flex align-items-center"
    >
      <div
        class="ml-2 cursor-pointer white-space-nowrap overflow-hidden text-overflow-ellipsis"
        @click="openSelectShop()"
        style="width: 300px"
      >
        {{ shopName }}
      </div>
    </div>
  </div>
</template>
