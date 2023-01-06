<script setup>
import { ref, onMounted, computed } from "vue";
const features = ref([
  {
    title: "Unlimited Inbox",
    image: "live-collaboration.svg",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Data Security",
    image: "security.svg",
    text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: "Cloud Backup Williams",
    image: "subscribe.svg",
    text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
]);
</script>
<template>
  <Carousel :value="features" :showNavigators="false" :autoplayInterval="5000">
    <template #item="slotProps">
      <div class="text-center mb-8">
        <img
          :src="'./images/illustration/' + slotProps.data.image"
          alt="Image"
          class="mb-6 w-6"
        />
        <div class="mx-auto font-medium text-xl mb-4 text-blue-900">
          {{ slotProps.data.title }}
        </div>
        <p class="m-0 text-blue-700 line-height-3">
          {{ slotProps.data.text }}
        </p>
      </div>
    </template>
  </Carousel>
</template>
