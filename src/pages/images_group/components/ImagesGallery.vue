<template>
    <div class="shadow-1 p-3 surface-card" style="cursor: pointer" @click="selectGallery(gallery_data.code)">
        <div class="flex justify-content-center align-items-center">
            <div class="p-0">
                <img src="@/assets/img/foldericon.svg" class="" />

                <!-- <div class="text-sm text-text-600">วันที่ {{ data.create_date }}</div>
                  <div class="text-sm text-text-600">โดย {{ data.creator }}</div> -->
            </div>
        </div>
        <div class="flex justify-content-start align-items-center">
            <div class="p-1">
                <div class="text-md text-900 font-medium mb-2">{{ gallery_data.name }}</div>
                <!-- <div class="text-sm text-text-600">วันที่ {{ data.create_date }}</div>
                  <div class="text-sm text-text-600">โดย {{ data.creator }}</div> -->
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted } from "vue";


const gallery_data = ref({
    code:"",
    name: "",
});

const props = defineProps({
    gallery_data: Object,
});

const emit = defineEmits(["selectGallery"]);


onMounted(async () => {
    gallery_data.value = props.gallery_data;
});

function selectGallery(code) {
    emit("selectGallery", code);
}

</script>