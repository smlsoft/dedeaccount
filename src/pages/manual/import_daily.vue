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
    storeApp.setPageTitle("วิธีนำเข้ารายการบัญชี");
    storeApp.setActivePage("manual_list");
    storeApp.setActiveChild("manual_daily");
});



</script>

<template>
    <AppLayout>
        <MainContentWarp>
            <div class="grid">
                <div class=" mb-12 col-12 md:col-12">
                    <div class=" align-items-center">
                        <p class="text-3xl font-medium text-900">วิธีนำเข้ารายการบัญชี
                        <ul class="text-2xl font-medium text-900">
                            <li>ไปที่เมนู <b>ข้อมูลรายวัน</b></li>
                            <li>คลิก <b>เพิ่มข้อมูลรายวัน</b></li>
                        </ul>
                        </p>
                    </div>
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <Image :src="imgWithbaseUrl('@/images/manual/daily/1.png')" alt="test" width="800" class=""
                        preview />
                </div>
                <div class=" mb-12 col-12 md:col-12">
                    <div class=" align-items-center">
                        <p class="text-3xl font-medium text-900">กรอกข้อมูล
                        <ul class="text-2xl font-medium text-900">
                            <li>เลขที่เอกสาร</li>
                            <li>เอกสารวันที่</li>
                            <li>หมายเลขดำเนินการ</li>
                            <li>งวดบัญชี</li>
                            <li>ปีบัญชี</li>
                            <li>กลุ่มบัญชี</li>
                            <li>สมุดรายวัน</li>
                            <li>คำอธิบาย</li>
                        </ul>
                        </p>
                    </div>
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <Image :src="imgWithbaseUrl('@/images/manual/daily/2.png')" alt="test" width="800" class=""
                        preview />
                </div>
                <div class=" mb-12 col-12 md:col-12">
                    <div class=" align-items-center">
                        <p class="text-3xl font-medium text-900">เลือกไฟล์นำเข้า</p>
                        <p class="text-2xl font-medium text-900"> *ตัวอย่าง Template เข้ารายการบัญชี <a
                                :href="imgWithbaseUrl('@/images/manual/template/template_daily.xls')" download><Button
                                    label="#Download" icon="pi pi-download"
                                    class="w-auto p-button-secondary"></Button></a></p>
                    </div>
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <Image :src="imgWithbaseUrl('@/images/manual/daily/3.png')" alt="test" width="800" class=""
                        preview />
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <div class="flex md:align-items-center md:justify-content-between flex-column md:flex-row pb-4">
                        <div class="flex align-items-center">
                            <span class="text-3xl font-medium text-900">ตรวจสอบข้อมูลในตารางและกดปุ่ม <span
                                    class="font-bold text-900">บันทึกรายวัน</span></span>
                        </div>
                    </div>
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <Image :src="imgWithbaseUrl('@/images/manual/daily/4.png')" alt="test" width="800" class=""
                        preview />
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <div class="flex md:align-items-center md:justify-content-between flex-column md:flex-row pb-4">
                        <div class="flex align-items-center">
                            <span class="text-3xl font-medium text-900">ยืนยันการบันทึกข้อมูลเอกสารรายวัน</span>
                        </div>

                    </div>
                </div>
                <div class="field mb-12 col-12 md:col-12">
                    <Image :src="imgWithbaseUrl('@/images/manual/daily/5.png')" alt="test" width="800" class=""
                        preview />
                </div>
            </div>
        </MainContentWarp>
    </AppLayout>
</template>
