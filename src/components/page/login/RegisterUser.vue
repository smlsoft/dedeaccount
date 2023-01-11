<script setup>
import { ref, onMounted, computed } from "vue";
import languageButton from "@/components/page/LanguageButton.vue";

const yourname = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const form_valid = ref({
  yourname: true,
  username: true,
  password: true,
  confirmPassword: true,
});

const props = defineProps({
  loadingSignUp: Boolean,
  registerSuccess: Boolean,
});
const emit = defineEmits(["loginMode", "signUpButton"]);

function loginMode() {
  emit("loginMode", "loginMenu");
}

function goLoginUser() {
  emit("loginMode", "login");
}

async function signUpButton() {
  const isPass = await verifyData();

  if (isPass) {
    emit("signUpButton", yourname.value, username.value, password.value);
  }
}

function verifyData() {
  let checkValid = 0;
  if (yourname.value == "") {
    form_valid.value.yourname = false;
    checkValid += 1;
  } else {
    form_valid.value.yourname = true;
  }

  if (username.value == "") {
    form_valid.value.username = false;
    checkValid += 1;
  } else {
    form_valid.value.username = true;
  }

  if (password.value == "") {
    form_valid.value.password = false;
    checkValid += 1;
  } else {
    form_valid.value.password = true;
  }

  if (confirmPassword.value == "") {
    form_valid.value.confirmPassword = false;
    checkValid += 1;
  } else {
    form_valid.value.confirmPassword = true;
  }

  if (confirmPassword.value == "") {
    form_valid.value.confirmPassword = false;
    checkValid += 1;
  } else {
    if (password.value != confirmPassword.value) {
      form_valid.value.password = false;
      form_valid.value.confirmPassword = false;
      checkValid += 1;
    } else {
      form_valid.value.password = true;
      form_valid.value.confirmPassword = true;
    }
  }

  if (checkValid == 0) {
    return true;
  } else {
    return false;
  }
}
</script>
<template>
  <div class="flex align-items-center justify-content-between mb-5">
    <div class="text-2xl align-items-center font-medium text-900">
      {{ $t("signup") }}
    </div>
    <languageButton />
  </div>
  <div v-if="!props.registerSuccess">
    <label for="name" class="block text-900 font-medium mb-2">Your name</label>
    <InputText
      id="name"
      type="text"
      class="w-full mb-3"
      placeholder="Your name"
      v-model="yourname"
      :class="!form_valid.yourname ? 'p-invalid' : ''"
    />
    <label for="email" class="block text-900 font-medium mb-2">Email</label>
    <InputText
      id="email"
      type="text"
      class="w-full mb-3"
      placeholder="Email"
      v-model="username"
      :class="!form_valid.username ? 'p-invalid' : ''"
    />
    <label for="password" class="block text-900 font-medium mb-2"
      >Password</label
    >
    <Password
      id="password"
      class="w-full mb-3"
      inputClass="w-full"
      v-model="password"
      toggleMask
      placeholder="Password"
      :feedback="false"
      :class="!form_valid.password ? 'p-invalid' : ''"
    />
    <label for="confirmPassword" class="block text-900 font-medium mb-2"
      >Confirm Password</label
    >
    <Password
      id="password"
      class="w-full mb-3"
      inputClass="w-full "
      v-model="confirmPassword"
      toggleMask
      placeholder="Confirm Password"
      :feedback="false"
      :class="!form_valid.confirmPassword ? 'p-invalid' : ''"
    />

    <Button
      v-if="props.loadingSignUp == false"
      label="Sign up"
      class="w-full py-3 font-medium primary-700"
      @click="signUpButton()"
    ></Button>

    <Button
      class="w-full py-3 font-medium primary-700"
      icon="pi pi-spin pi-spinner "
      v-if="props.loadingSignUp == true"
    ></Button>
    <div class="mt-6 text-center text-600">
      Already have an account ?
      <a
        @click="loginMode()"
        tabindex="0"
        class="cursor-pointer font-medium text-primary-500"
        >Login now</a
      >
    </div>
  </div>
  <div v-if="props.registerSuccess">
    <div
      class="flex flex-column lg:flex-row justify-content-center align-items-center gap-7"
    >
      <div class="text-center">
        <div class="mt-6 mb-3 font-bold text-6xl text-900">
          Register Success!
        </div>
        <p class="text-700 text-3xl mt-0 mb-6">Wellcom to dede account.</p>
        <Button
          @click="goLoginUser()"
          type="button"
          label="Login Now!"
          class="p-button-outlined"
        ></Button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.p-divider-solid.p-divider-horizontal:before {
  border-top-style: solid;
}
</style>
