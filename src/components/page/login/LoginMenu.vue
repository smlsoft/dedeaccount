<script setup>
import languageButton from "@/components/page/LanguageButton.vue";
import { ref, onUnmounted } from "vue";

const emit = defineEmits(["loginMode", "registerMode", "loginWithGoogle"]);

function loginMode() {
  emit("loginMode", "login");
}

function registerMode() {
  emit("registerMode", "registerMenu");
}

function loginWithGoogle() {
  emit("loginWithGoogle", "loginWithGoogle");
}

let pressTimer = ref(null);
const showLoginUser = ref(false);

const startHold = () => {
  pressTimer.value = setTimeout(() => {
    showLoginUser.value = true;
  }, 5000); // 5000ms = 5 seconds
};

const cancelHold = () => {
  clearTimeout(pressTimer.value);
  pressTimer.value = null;
};

// Clean up on component unmount
onUnmounted(() => {
  clearTimeout(pressTimer.value);
});
</script>

<template>
  <div class="flex flex-column justify-content-between flex-wrap h-full">
    <div class="flex flex-column">
      <div class="flex align-items-center justify-content-between mb-5">
        <div class="mb-3 lg:mb-0">
          <div class="text-2xl font-medium text-900 mb-2">
            <div>{{ $t("signin") }}</div>
          </div>
          <div class="text-500 mr-0 md:mr-3">
            {{ $t("signin_desciption") }}
          </div>
        </div>
        <languageButton />
      </div>
      <div class="flex justify-content-center mt-6">
        <img
          src="@/assets/img/dedeaccount_logo.png"
          alt="Image"
          height="200"
          width="200"
          class="mb-3"
          @mousedown.prevent="startHold"
          @mouseup.prevent="cancelHold"
          @mouseleave.prevent="cancelHold"
        />
      </div>
      <div class="flex justify-content-center">
        <Button
          @click="loginWithGoogle"
          class="w-full mt-3 font-medium border-1 surface-border surface-100 py-2 px-5 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 align-items-center justify-content-center"
        >
          <i class="pi pi-google text-red-500" style="font-size: 20px"></i>
          <span class="ml-2">{{ $t("singin_with") }} Google</span>
        </Button>
      </div>
      <div class="flex align-items-center justify-content-end mt-2" v-if="showLoginUser">
        <a
          @click="loginMode()"
          class="font-medium text-primary-500 cursor-pointer"
          >{{ $t("login_user") }}</a
        >
      </div>
    </div>
    <div class="mt-6 text-center text-600" v-if="showLoginUser">
      {{ $t("user_have_account") }}
      <a
        @click="registerMode()"
        tabindex="0"
        class="cursor-pointer font-medium text-primary-700"
      >
        {{ $t("signup") }}</a
      >
    </div>
    <div class="mt-3 text-center text-600" style="font-size: 12px">
      {{ $t("accept_term") }}
      <span style="text-decoration: underline"> {{ $t("terms") }}</span>
      {{ $t("Read") }}
      <span style="text-decoration: underline"> {{ $t("privacy") }}</span>
    </div>
  </div>
</template>
