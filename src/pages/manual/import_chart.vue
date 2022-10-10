<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";



const storeApp = useApp();

const imgWithbaseUrl = (uri) => {


    let baseUrl = (process.env.NODE_ENV == "development") ? import.meta.url : process.env.VUE_APP_URL;
    console.log("Mode :", process.env.NODE_ENV, baseUrl)

    if (process.env.NODE_ENV != "development") {
        uri = uri.replace('@/', import.meta.env.BASE_URL)
    } else {
        uri = uri.replace('@/', import.meta.env.BASE_URL)
    }

    return new URL(uri, baseUrl).href

}

onMounted(() => {
    storeApp.setPageTitle("วิธีนำเข้าผังบัญชี");
    storeApp.setActivePage("manual_list");
    storeApp.setActiveChild("manual_chart");
});



</script>

<template>
    <AppLayout>
        <MainContentWarp>
            <div class="grid">
                <div class=" mb-12 col-12 md:col-12">
                    <div class=" align-items-center">
                        <p class="text-3xl font-medium text-900">วิธีนำเข้าผังบัญชี
                        <ul class="text-2xl font-medium text-900">
                            <li>ไปที่เมนู <b>ผังบัญชี</b></li>
                            <li>คลิก <b>นำเข้าผังบัญชี</b></li>
                        </ul>
                        </p>
                    </div>
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <!-- <img :src="imgWithbaseUrl('@/images/manual/chart/1.png')" />-->
                    <Image :src="imgWithbaseUrl('@/images/manual/chart/1.png')" alt="test" width="800" class=""
                        preview />

                </div>
                <div class=" mb-12 col-12 md:col-12">
                    <div class=" align-items-center">
                        <p class="text-3xl font-medium text-900">เลือกไฟล์นำเข้า</p>
                        <p class="text-2xl font-medium text-900"> *ตัวอย่าง Template นำเข้าผังบัญชี
                            <a :href="imgWithbaseUrl('@/images/manual/template/template_chart.xls')" download><Button
                                    label="#Download" icon="pi pi-download"
                                    class="w-auto p-button-secondary"></Button></a>
                        </p>
                    </div>
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <Image :src="imgWithbaseUrl('@/images/manual/chart/2.png')" alt="test" width="800" class=""
                        preview />
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <div class="flex md:align-items-center md:justify-content-between flex-column md:flex-row pb-4">
                        <div class="flex align-items-center">
                            <span class="text-3xl font-medium text-900">ตรวจสอบข้อมูลในตารางและกดปุ่ม <span
                                    class="font-bold text-900">บันทึกนำเข้าผังบัญชี</span></span>
                        </div>
                    </div>
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <Image :src="imgWithbaseUrl('@/images/manual/chart/3.png')" alt="test" width="800" class=""
                        preview />
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <div class="flex md:align-items-center md:justify-content-between flex-column md:flex-row pb-4">
                        <div class="flex align-items-center">
                            <span class="text-3xl font-medium text-900">ยืนยันการบันทึกข้อมูลผังบัญชี</span>
                        </div>

                    </div>
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <Image :src="imgWithbaseUrl('@/images/manual/chart/4.png')" alt="test" width="800" class=""
                        preview />
                </div>
            </div>
        </MainContentWarp>
    </AppLayout>
</template>
