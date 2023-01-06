<script setup>
import { ref, onMounted, computed } from "vue";
import { useApp } from "@/stores/app.js";

const storeApp = useApp();
onMounted(() => {
  chooseLanguage(storeApp.activeLang);
});
const selectLanguage = ref();
const languages = ref([
  { code: "th", codeTranslator: "th", name: "ไทย", image: "th.png", use: true },
  {
    code: "en",
    codeTranslator: "en",
    name: "อังกฤษ",
    image: "en.png",
    use: true,
  },
  {
    code: "cn",
    codeTranslator: "zh-cn",
    name: "จีน",
    image: "ch.png",
    use: true,
  },
  {
    code: "jp",
    codeTranslator: "th",
    name: "ญี่ปุ่น",
    image: "jp.png",
    use: true,
  },
  {
    code: "kr",
    codeTranslator: "th",
    name: "เกาหลี",
    image: "kr.png",
    use: true,
  },
  { code: "lo", codeTranslator: "lo", name: "ลาว", image: "lo.png", use: true },
  {
    code: "mr",
    codeTranslator: "th",
    name: "เมียนม่า",
    image: "th.png",
    use: false,
  },
  {
    code: "my",
    codeTranslator: "th",
    name: "มาเลเซีย",
    image: "th.png",
    use: false,
  },
  {
    code: "vi",
    codeTranslator: "th",
    name: "เวียดนาม",
    image: "th.png",
    use: false,
  },
  {
    code: "km",
    codeTranslator: "th",
    name: "เขมร",
    image: "th.png",
    use: false,
  },
]);

const chooseLanguage = (data) => {
  let ele = [];
  ele = languages.value.filter((val) => val.code == data);
  selectLanguage.value = ele[0].image;
  storeApp.activeLang = data;
};
</script>
<template>
  <li class="inline-flex relative">
    <a
      v-ripple
      class="text-900 font-medium inline-flex align-items-end cursor-pointer text-700 hover:text-primary p-ripple"
      v-styleclass="{
        selector: '@next',
        enterClass: 'hidden',
        enterActiveClass: 'scalein',
        leaveToClass: 'hidden',
        leaveActiveClass: 'fadeout',
        hideOnOutsideClick: true,
      }"
    >
      <img
        :src="'./images/flags/' + selectLanguage"
        alt="Flag"
        style="width: 30px"
      />
    </a>
    <div
      class="hidden border-round surface-overlay p-3 shadow-2 absolute right-0 top-100 z-2 w-15rem origin-top"
    >
      <ul class="list-none p-0 m-0">
        <li v-for="language in languages" :key="language.code">
          <div v-if="language.use == true">
            <a
              class="cursor-pointer hover:text-900 hover:surface-100 border-round flex align-items-center px-3 py-2"
              @click="chooseLanguage(language.code)"
            >
              <img
                :src="'/images/flags/' + language.image"
                class="mr-2"
                alt="Flag"
                style="width: 30px"
              />
              <span>{{ language.name }}</span>
            </a>
          </div>
        </li>
      </ul>
    </div>
  </li>
</template>
