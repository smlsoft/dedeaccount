<script setup>
import { useApp } from "@/stores/app.js";
import { ref, computed, onMounted, onUnmounted } from "vue";

const storeApp = useApp();

// แทนที่จะใช้ computed property ให้ใช้ ref ที่เราอัพเดตได้
const shopName = ref(localStorage.shop_name || "");
const userName = ref(localStorage._usercode || "");

const emit = defineEmits(["openSelectShop"]);

function openSelectShop() {
  emit("openSelectShop");
}

// ฟังก์ชันสำหรับจัดการเหตุการณ์เมื่อมีการอัพเดต shop
function handleShopUpdate(event) {
  if (event.detail && event.detail.shopName) {
    shopName.value = event.detail.shopName;
  }
}

onMounted(() => {
  // รับฟังเหตุการณ์ shop-updated ที่เราส่งจากหน้า shop_profile
  window.addEventListener('shop-updated', handleShopUpdate);
  
  // ตั้งค่าเริ่มต้นจาก localStorage
  shopName.value = localStorage.shop_name || "";
  userName.value = localStorage._usercode || "";
});

onUnmounted(() => {
  // ทำความสะอาด event listener เมื่อ component ถูกทำลาย
  window.removeEventListener('shop-updated', handleShopUpdate);
});
</script>

<template>
  <div
    class="flex justify-content-between align-items-center px-2 relative lg:static sm:h-4rem lg:h-2rem"
    style="
      background: linear-gradient( 90deg,#025a86 35.86%,rgb(77 153 168) 97.37%);
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
        <i class="pi pi-bars text-4xl text-white"></i>
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
      >
        Username: {{ userName }}
      </div>

      <div
        class="ml-2 cursor-pointer white-space-nowrap overflow-hidden text-overflow-ellipsis"
        @click="openSelectShop()"
        style="width: 300px"
      >
        Shop: {{ shopName }}
      </div>
    </div>
  </div>
</template>
