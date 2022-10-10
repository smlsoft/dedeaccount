<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthen } from "@/stores/authen.js";
import { useApp } from "@/stores/app.js";

const storeApp = useApp();
const store = useAuthen();
const router = useRouter();

onMounted(() => {
  storeApp.setPageTitle("ออกจากระบบ");

  store.logout();

});
</script>
<template>
  <div class="surface-0 flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
    <div class="grid justify-content-center p-2 lg:p-0" style="min-width:80%">
      <div class="col-12 xl:col-6"
        style="border-radius:56px; padding:0.3rem; background: linear-gradient(180deg, var(--primary-color), rgba(33, 150, 243, 0) 40%); ">
        <div class="h-full w-full m-0 py-7 px-4"
          style="border-radius:53px; background: linear-gradient(180deg, var(--surface-50) 38.9%, var(--surface-0));">
          <div class="text-center mb-5">
            <img src="@/assets/subscribe.svg" alt="Image" class="mx-auto block mb-4" />
            <div class="text-900 text-3xl font-medium mb-3">Thankyou!</div>
            <p class="mt-0 mb-4 p-0 line-height-3">
              Nunc mi ipsum faucibus vitae aliquet nec. Lacus sed viverra tellus in hac
              habitasse platea dictumst.
            </p>
            <Button label="Sign In" icon="pi pi-arrow-right" class="p-button-rounded" iconPos="right"
              @click="router.push('/login')"></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
