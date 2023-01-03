<script setup>
import AuthenService from "@/services/AuthenService";
import { useApp } from "@/stores/app.js";
import { ref, onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import { menus } from "@/api/menu";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
const shopName = localStorage.shop_name;
const storeApp = useApp();

onMounted(() => {});
</script>

<template>
  <div class="bg-blue-900 px-4 py-0">
    <div class="flex align-items-center justify-content-between">
      <div class="font-medium text-1xl text-white">
        {{ storeApp.PageTitle }}
      </div>
      <div class="font-medium text-1xl text-white">{{ shopName }}</div>
    </div>
  </div>
</template>
