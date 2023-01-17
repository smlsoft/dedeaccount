<script setup>
import { ref, onMounted, computed } from "vue";
import languageButton from "@/components/page/LanguageButton.vue";

const username = ref("");
const password = ref("");
const remember = ref(false);

const props = defineProps({
  loading: Boolean,
  loginFailed: Boolean,
});

const emit = defineEmits(["loginMode", "loginButton", "registerMode"]);

function loginMode() {
  emit("loginMode", "loginMenu");
}

function registerMode() {
  emit("registerMode", "registerMenu");
}

function loginButton() {
  emit("loginButton", username.value, password.value);
}
</script>
<template>
  <div class="flex align-items-center justify-content-between mb-5">
    <div class="text-2xl align-items-center font-medium text-900">
      {{ $t("signin") }}
    </div>
    <languageButton />
  </div>
  <label for="user" class="block text-900 font-medium mb-2">
    {{ $t("email") }}</label
  >
  <InputText
    id="user"
    type="text"
    class="w-full mb-3 p-3"
    placeholder="Email"
    style="padding: 1rem"
    v-model="username"
  />
  <label for="password" class="block text-900 font-medium mb-2">
    {{ $t("password") }}</label
  >
  <InputText
    id="password"
    type="password"
    class="w-full mb-3 p-3"
    placeholder="Password"
    style="padding: 1rem"
    v-model="password"
  />
  <div class="flex align-items-center justify-content-between mb-4">
    <div class="flex align-items-center">
      <Checkbox
        id="rememberme4"
        v-model="remember"
        :binary="true"
        class="mr-2"
      ></Checkbox>
      <label for="rememberme4">{{ $t("remember") }}</label>
    </div>
    <a class="font-medium text-primary-500 cursor-pointer">{{
      $t("forgot_pass")
    }}</a>
  </div>

  <span v-if="props.loginFailed" class="text-xs text-red-500"
    >*Invalid Username or Password.</span
  >
  <Button
    label="Login"
    class="w-full py-3 font-medium primary-700"
    v-if="props.loading == false"
    @click="loginButton()"
  >
    <label style="text-align: center; margin: auto"
      >{{ $t("signin") }}
    </label></Button
  >
  <Button
    class="w-full py-3 font-medium primary-700"
    icon="pi pi-spin pi-spinner "
    v-if="props.loading == true"
  ></Button>

  <Divider align="center" class="my-4">
    <span class="text-600 font-normal text-sm"> {{ $t("or") }}</span>
  </Divider>

  <Button
    @click="loginMode()"
    class="w-12 font-medium border-1 surface-border surface-100 py-2 px-2 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center justify-content-center"
  >
    <span>{{ $t("another_login") }}</span>
  </Button>

  <div class="mt-6 text-center text-600">
    {{ $t("user_have_account") }}
    <a
      @click="registerMode"
      tabindex="0"
      class="cursor-pointer font-medium text-primary-700"
    >
      {{ $t("signup") }}</a
    >
  </div>
</template>
<style scoped>
.p-divider-solid.p-divider-horizontal:before {
  border-top-style: solid;
}
</style>
