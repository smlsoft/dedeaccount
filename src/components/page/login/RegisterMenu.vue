<script setup>
import { ref, onMounted, computed } from "vue";
import languageButton from "@/components/page/LanguageButton.vue";

const emit = defineEmits(["loginMode", "registerMode" , "loginWithGoogle"]);

function loginMode() {
  emit("loginMode", "loginMenu");
}

function registerMode() {
  emit("registerMode", "register");
}

function loginWithGoogle() {
  emit("loginWithGoogle", "loginWithGoogle");
}
</script>

<template>
  <div class="flex align-items-center justify-content-between mb-5">
    <div class="mb-3 lg:mb-0">
      <div class="text-2xl font-medium text-900 mb-2">
        {{ $t("signup") }}
      </div>
      <div class="text-500 mr-0 md:mr-3">
        {{ $t("signin_desciption") }}
      </div>
    </div>
    <languageButton />
  </div>
  <div class="flex flex-column">
    <Button
    @click="loginWithGoogle"
      class="w-12 font-medium border-1 surface-border surface-100 py-2 px-5 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center"
    >
      <i class="pi pi-google text-red-500" style="font-size: 20px"></i>
      <span class="ml-2">{{ $t("signUp_with") }} Google</span>
    </Button>
    <!-- <Button
      class="mt-3 w-12 font-medium border-1 surface-border surface-100 py-2 px-5 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center"
    >
      <img src="@/assets/img/iconline.svg" width="20" height="20" />
      <span class="ml-2">{{ $t("signUp_with") }} Line</span>
    </Button>
    <Button
      class="mt-3 w-12 font-medium border-1 surface-border surface-100 py-2 px-5 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center"
    >
      <i class="pi pi-facebook text-blue-500" style="font-size: 20px"></i>
      <span class="ml-2">{{ $t("signUp_with") }} Facebook</span>
    </Button>
    <Button
      class="mt-3 w-12 font-medium border-1 surface-border surface-100 py-2 px-5 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center"
    >
      <i class="pi pi-apple text-gray-700" style="font-size: 20px"></i>
      <span class="ml-2">{{ $t("signUp_with") }} Apple</span>
    </Button>
    <Button
      class="mt-3 w-12 font-medium border-1 surface-border surface-100 py-2 px-5 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center"
    >
      <i class="pi pi-phone text-teal-900" style="font-size: 20px"></i>
      <span class="ml-2">{{ $t("signUp_with_telephone") }}</span>
    </Button> -->
  </div>
  <Divider align="center" class="my-4">
    <span class="text-600 font-normal text-sm"> {{ $t("or") }}</span>
  </Divider>
  <Button
    @click="registerMode()"
    class="w-12 font-medium border-1 surface-border surface-100 py-2 px-2 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center justify-content-center"
  >
    <span>{{ $t("signUp_with") }}</span>
  </Button>
  <div class="mt-6 text-center text-600">
    {{ $t("userif_have") }}
    <a
      @click="loginMode()"
      tabindex="0"
      class="cursor-pointer font-medium text-primary-700"
    >
      {{ $t("signin") }}</a
    >
  </div>

  <div class="mt-3 text-center text-600" style="font-size: 12px">
    {{ $t("accept_term") }}
    <span style="text-decoration: underline"> {{ $t("terms") }}</span>
    {{ $t("Read") }}
    <span style="text-decoration: underline"> {{ $t("privacy") }}</span>
  </div>
</template>

<style scoped>
.p-divider-solid.p-divider-horizontal:before {
  border-top-style: solid;
}
</style>
