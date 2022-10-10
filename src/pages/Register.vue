<script setup>
import BlankLayout from "@/components/layout/BlankLayout.vue";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useAuthen } from "@/stores/authen.js";
import { useApp } from "@/stores/app.js";
import { useToast } from "primevue/usetoast";

const storeApp = useApp();
const store = useAuthen();
const name = ref("");
const username = ref("");
const password = ref("");
const showShopList = ref(false);
const loading = ref(false);
const router = useRouter();
const registerFailed = ref(false);
const toast = useToast();

async function register() {

  loading.value = true;

  await store.register(name.value, username.value, password.value);

  if (store.registerSuccess) {
    toast.add({
      severity: "success",
      summary: "success",
      detail: "บันทึกข้อมูลสำเร็จ",
      life: 5000,
    });
    setTimeout(() => {
      router.push({
        name: "login",
      });
    }, 1000);
  } else {
    registerFailed.value = true;
  }

  loading.value = false;
}

function goHome() {
  router.push({
    name: "login",
  });
}

onMounted(() => {
  storeApp.setPageTitle("สมัครสมาชิก");
});
</script>
<!--
<template>
  <Toast />
  <div class="surface-ground px-4 py-8 md:px-6 lg:px-8 flex align-items-center justify-content-center">
    <div class="surface-card p-4 shadow-2 border-round w-full lg:w-6" v-if="!showShopList">
      <div class="text-center mb-5">
        <img src="@/assets/dedepos.png" alt="Image" height="50" class="mb-3" />
        <div class="text-900 text-3xl font-medium mb-3">VillageFund GL</div>
        <span class="text-600 font-medium line-height-3">Register </span>
        <a class="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer" @click="goHome">Login!</a>
      </div>

      <div>
        <label for="name" class="block text-900 font-medium mb-2">Name</label>
        <InputText id="name" type="text" class="w-full mb-3" v-model="name" />
        <label for="username" class="block text-900 font-medium mb-2">Email</label>
        <InputText id="username" type="text" class="w-full mb-3" v-model="username" />

        <label for="password1" class="block text-900 font-medium mb-2">Password</label>
        <InputText id="password1" type="password" class="w-full mb-3" v-model="password" />

        <div style="height: 20px">
          <span v-if="registerFailed" style="color: #ff0000" class="text-xs">{{ store.registerErrorMsg }}</span>
        </div>
        <Button label="Register" icon="pi pi-user" class="w-full" v-if="loading == false" @click="register()"></Button>
        <Button icon="pi pi-spin pi-spinner" v-if="loading == true" class="w-full"></Button>
      </div>
    </div>
  </div>
</template>
-->
<template>
  <Toast />
  <div class="surface-0 flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
    <div class="grid justify-content-center p-2 lg:p-0" style="min-width:80%">
      <div class="col-12 xl:col-6"
        style="border-radius:56px; padding:0.3rem; background: linear-gradient(180deg, var(--primary-color), rgba(33, 150, 243, 0) 40%); ">
        <div class="h-full w-full m-0 py-7 px-4"
          style="border-radius:53px; background: linear-gradient(180deg, var(--surface-50) 38.9%, var(--surface-0));">
          <div class="text-center mb-5">
            <img src="@/assets/dedepos.png" alt="Image" height="150" class="mb-3" />
            <div class="text-900 text-3xl font-medium mb-3">REGISTER DEDEPOS!</div>
            <a class="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer" @click="goHome">LOGIN DEDEPOS</a>
          </div>
          <div class="w-full md:w-10 mx-auto">
            <label for="name" class="block text-900 text-xl font-medium mb-2">Name</label>
            <InputText id="name" type="text" class="w-full mb-3" placeholder="Name" style="padding:1rem;"
              v-model="name" />
            <label for="username" class="block text-900 text-xl font-medium mb-2">Username</label>
            <InputText id="username" type="text" class="w-full mb-3" placeholder="Username" style="padding:1rem;"
              v-model="username" />
            <label for="password1" class="block text-900 font-medium text-xl mb-2">Password</label>
            <InputText id="password1" type="password" class="w-full mb-3" placeholder="Password" style="padding:1rem;"
              v-model="password" />
            <div style="height: 20px">
              <span v-if="registerFailed" style="color: #ff0000" class="text-xs">{{ store.registerErrorMsg }}</span>
            </div>
            <Button label="Register" icon="pi pi-user" class="w-full p-3 text-xl" v-if="loading == false"
              @click="register()"></Button>
            <Button icon="pi pi-spin pi-spinner" v-if="loading == true" class="w-full p-3 text-xl"></Button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

