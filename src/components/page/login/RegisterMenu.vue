<script setup>
import { ref, onMounted, computed } from "vue";
import languageButton from "@/components/page/LanguageButton.vue";

const emit = defineEmits(["loginMode", "registerMode"]);

function loginMode() {
  emit("loginMode", "loginMenu");
}

function registerMode() {
  emit("registerMode", "register");
}
</script>

<template>
  <div class="flex align-items-center justify-content-between mb-5">
    <div class="mb-3 lg:mb-0">
      <div class="text-2xl font-medium text-900 mb-2">
        ลงทะเบียนเพื่อสมัครเข้าใช้งาน
      </div>
      <div class="text-500 mr-0 md:mr-3">
        ใช้อีเมลหรือบริการอื่นของคุณเพื่อใช้งาน Dede Account
      </div>
    </div>
    <languageButton />
  </div>
  <div class="flex flex-column">
    <Button
      class="w-12 font-medium border-1 surface-border surface-100 py-2 px-5 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center"
    >
      <i class="pi pi-google text-red-500" style="font-size: 20px"></i>
      <span class="ml-2">สมัครใช้งานด้วย Google</span>
    </Button>
    <Button
      class="mt-3 w-12 font-medium border-1 surface-border surface-100 py-2 px-5 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center"
    >
      <img src="@/assets/img/iconline.svg" width="20" height="20" />
      <span class="ml-2">สมัครใช้งานด้วย Line</span>
    </Button>
    <Button
      class="mt-3 w-12 font-medium border-1 surface-border surface-100 py-2 px-5 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center"
    >
      <i class="pi pi-facebook text-blue-500" style="font-size: 20px"></i>
      <span class="ml-2">สมัครใช้งานด้วย Facebook</span>
    </Button>
    <Button
      class="mt-3 w-12 font-medium border-1 surface-border surface-100 py-2 px-5 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center"
    >
      <i class="pi pi-apple text-gray-700" style="font-size: 20px"></i>
      <span class="ml-2">สมัครใช้งานด้วย Apple</span>
    </Button>
    <Button
      class="mt-3 w-12 font-medium border-1 surface-border surface-100 py-2 px-5 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center"
    >
      <i class="pi pi-phone text-teal-900" style="font-size: 20px"></i>
      <span class="ml-2">สมัครใช้งานด้วยหมายเลขโทรศัพท์มือถือ</span>
    </Button>
  </div>
  <Divider align="center" class="my-4">
    <span class="text-600 font-normal text-sm">OR</span>
  </Divider>
  <Button
    @click="registerMode()"
    class="w-12 font-medium border-1 surface-border surface-100 py-2 px-2 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center justify-content-center"
  >
    <span>สมัครใช้งานด้วยวิธีอื่น</span>
  </Button>
  <div class="mt-6 text-center text-600">
    หากคุณมีบัญชีอยู่แล้วสามารถ
    <a
      @click="loginMode()"
      tabindex="0"
      class="cursor-pointer font-medium text-primary-700"
      >ลงชื่อเข้าใช้ที่นี่</a
    >
  </div>

  <div class="mt-3 text-center text-600" style="font-size: 12px">
    เมื่อดำเนินการต่อไป คุณได้ยอมรับ
    <span style="text-decoration: underline">ข้อตกลงในการใช้งาน</span>
    อ่าน
    <span style="text-decoration: underline">นโยบายความเป็นส่วนตัว</span>
    ของเรา
  </div>
</template>

<style scoped>
.p-divider-solid.p-divider-horizontal:before {
  border-top-style: solid;
}
</style>
