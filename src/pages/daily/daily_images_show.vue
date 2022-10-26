<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { DomHandler } from "primevue/utils";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";



const storeApp = useApp();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const WsConnectImage = ref();
const WsConnectAllImage = ref();
const connection = ref();
const doc_images = ref([]);
const selectedImgUrl = ref("");
const showThumbnails = ref(false);
const rotate = ref(0);
const isChange = ref(false);
// zoom image
const scale = ref(1);
const panning = ref(false);
const pointX = ref(0);
const pointY = ref(0);
const start = ref({ x: 0, y: 0 });
const zoomStyle = ref("");

const margintop = ref(0);
const marginbtm = ref(0);
const confirmChangeImageDialog = ref(false);
onUnmounted(() => {
  // WsConnectAllImage.value.close();
  WsConnectImage.value.close();
  connection.value.close();
});
const imagePreviewStyle = computed({
  get() {
    return {
      transform: "rotate(" + rotate.value + "deg) ",
    };
  },
});


onMounted(() => {
  storeApp.setActivePage("daily");
  storeApp.setActiveChild("daily_images_list");

  storeApp.setPageTitle("รูปภาพเอกสาร ");

  WSImageConnect();
  // WsAllImageConnect();
  websocketConnect();
});


function rotateRight() {
  rotate.value += 90;
}
function rotateLeft() {
  rotate.value -= 90;
}



function websocketConnect() {
  connection.value = new WebSocket(
    "wss://api.dev.dedepos.com/gl/journal/ws/form?apikey=" +
    localStorage.getItem("_token")
  );
  connection.value.onopen = function (event) {
    //console.log(event);
    //console.log("Successfully connected to the echo websocket server...");
  };
  connection.value.onmessage = function (event) {
    console.log("onmessage ", event);
    var jsonData = JSON.parse(event.data);
    if (jsonData.docref != "") {
      MasterdataService.getImagesByDocref(jsonData.docref)
        .then((res) => {
          if (res.success) {
            console.log(res.data);
            if (res.data.documentimages.length > 0) {
              doc_images.value = res.data;
              //console.log(doc_images.value.documentref);
              if (res.data.documentimages.length > 1) {
                showThumbnails.value = true;
              } else {
                showThumbnails.value = false;
              }

              selectedImgUrl.value = res.data.documentimages[0].imageuri;
            }
          }
        })
        .catch((err) => {
          // console.log(err);
        });
    } else {
      //goList();
      selectedImgUrl.value = "";
      doc_images.value = [];
    }
  };

  connection.value.onclose = function (e) {
    console.log("Socket is closed. Reconnect will be attempted in 1 second.", e.reason);
    setTimeout(function () {
      if (
        localStorage._token != "" &&
        localStorage._token != undefined &&
        route.name == "daily_images_show"
      ) {
        console.log(
          "Socket is closed. Reconnect will be attempted in 1 second.",
          e.reason
        );
        websocketConnect();
        // getAllSelectImage();
      }
    }, 1000);
  };
}

function WSImageConnect() {
  WsConnectImage.value = new WebSocket(
    "wss://api.dev.dedepos.com/gl/journal/ws/image?apikey=" +
    localStorage.getItem("_token")
  );
  WsConnectImage.value.onopen = function (event) {
    // console.log(event);
    // console.log(
    //   "WsConnectImage Successfully connected to the echo websocket server..."
    // );
  };
  WsConnectImage.value.onmessage = function (event) {
    console.log("WsConnectImagesss ", event);
    var jsonData = JSON.parse(event.data);
    if (jsonData.event != undefined) {
      if ((jsonData.event = "change")) {
        if (jsonData.payload.status == 0) {
          isChange.value = false;
        } else {
          isChange.value = true;
        }
      }
    }
  };
  WsConnectImage.value.onclose = function (e) {
    // console.log(
    //   "WsConnectImage Socket is closed. Reconnect will be attempted in 1 second.",
    //   e.reason
    // );
    setTimeout(function () {
      if (
        localStorage._token != "" &&
        localStorage._token != undefined &&
        route.name == "dailyImagesList"
      ) {
        console.log(
          "Socket is closed. Reconnect will be attempted in 1 second.",
          e.reason
        );
        WSImageConnect();
      }
    }, 1000);
  };
}
// function WsAllImageConnect() {
//   WsConnectAllImage.value = new WebSocket(
//     "wss://api.dev.dedepos.com/gl/journal/ws/docref?apikey=" +
//       localStorage.getItem("_token")
//   );
//   WsConnectAllImage.value.onopen = function (event) {
//     // console.log(event);
//     // console.log(
//     //   "WsAllImage Connect Successfully connected to the echo websocket server..."
//     // );
//   };
//   WsConnectAllImage.value.onmessage = function (event) {
//     var jsonData = JSON.parse(event.data);
//     console.log("jsonData ", jsonData);
//     if (jsonData.status == "selected") {
//       console.log("selected");
//     } else if (jsonData.status == "unselected") {
//       console.log("unselected");
//       if (jsonData.username == localStorage._usercode) {
//         goList();
//       }
//     }
//   };
//   WsConnectAllImage.value.onclose = function (e) {
//     // console.log(
//     //   "WsAllImageConnect Socket is closed. Reconnect will be attempted in 1 second.",
//     //   e.reason
//     // );
//     setTimeout(function () {
//       WsAllImageConnect();
//     }, 1000);
//   };
// }
function goForm() {
  router.push({ name: "daily_images_form" });
}
function goList() {
  if (isChange.value) {
    confirmChangeImageDialog.value = true;
  } else {
    var sendData = { docref: doc_images.value.documentref };
    MasterdataService.postUnSelectImage(sendData)
      .then((res) => {
        // console.log(res);
        if (res.success) {
          router.push({ name: "daily_images_list" });
        }
      })
      .catch((err) => {
        router.push({ name: "daily_images_list" });
      });
  }
}

function onNext() {
  if (isChange.value) {
    confirmChangeImageDialog.value = true;
  } else {
    MasterdataService.postNextImage()
      .then((res) => {
        if (res.success) {

          console.log(res.data);
          scale.value = 1;
          panning.value = false;
          pointX.value = 0;
          pointY.value = 0;
          start.value = { x: 0, y: 0 };
          zoomStyle.value = "";
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}


const setTransform = () => {
  zoomStyle.value = "transform:translate(" + pointX.value + "px, " + pointY.value + "px) scale(" + scale.value + ")";
}

function onmousedown(e) {
  console.log(e);
  e.preventDefault();
  start.value = { x: e.clientX - pointX.value, y: e.clientY - pointY.value };
  panning.value = true;
}

function onmouseup(e) {
  console.log(e);
  panning.value = false;
}

function onmousemove(e) {
  e.preventDefault();
  if (!panning.value) {
    return;
  }
  pointX.value = (e.clientX - start.value.x);
  pointY.value = (e.clientY - start.value.y);

  setTransform();
}

function onwheel(e) {
  e.preventDefault();
  var xs = (e.clientX - pointX.value) / scale.value,
    ys = (e.clientY - pointY.value) / scale.value,
    delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
  (delta > 0) ? (scale.value *= 1.2) : (scale.value /= 1.2);
  pointX.value = e.clientX - xs * scale.value;
  pointY.value = e.clientY - ys * scale.value;

  console.log(pointX.value);
  console.log(pointY.value);

  setTransform();
}

</script>

<template>
  <div class="min-h-screen flex relative lg:static surface-ground">
    <div class="min-h-screen flex flex-column relative flex-auto bg-dark bg-center surface-900">
      <div class="p-image-toolbar" style="z-index: 160">
        <button class="p-image-action p-link text-blue-600" type="button" @click="goForm">
          <i class="pi pi-file"></i>
        </button>
        <button class="p-image-action p-link text-blue-600" type="button" @click="rotateRight">
          <i class="pi pi-refresh"></i>
        </button>
        <button class="p-image-action p-link text-blue-600" type="button" @click="rotateLeft">
          <i class="pi pi-undo"></i>
        </button>
        <button class="p-image-action p-link text-blue-600" type="button" @click="goList">
          <i class="pi pi-times"></i>
        </button>
      </div>
      <transition name="p-image-preview" style="z-index: 150">
        <div class="p-galleria-item-container">
          <!-- <button class="p-image-action p-link text-blue-600" type="button" style="
              position: absolute !important;
              top: 45vh !important;
              left: 0px !important;
            " @click="onNext()">
            <i class="pi pi-chevron-left"></i>
          </button> -->
          <div class="p-galleria-item">
            <div>
              <div id="zoom" :style="zoomStyle" @mousedown="onmousedown($event)" @mouseup="onmouseup($event)"
                @mousemove="onmousemove($event)" @wheel="onwheel($event)">
                <img v-if="selectedImgUrl != ''" :src="selectedImgUrl" :style="imagePreviewStyle" />
              </div>
              <!-- <img
                @wheel="zoomWheel"
                v-if="selectedImgUrl != ''"
                :src="selectedImgUrl"
                class="p-image-preview zoom"
                :style="imagePreviewStyle"
              /> -->
              <ProgressSpinner v-if="selectedImgUrl == ''" animationDuration="10s" />
            </div>
          </div>

          <!-- <button class="p-image-action p-link text-blue-600" type="button" @click="onNext()" style="
              position: absolute !important;
              top: 45vh !important;
              right: 0px !important;
            ">
            <i class="pi pi-chevron-right"></i>
          </button> -->
        </div>
      </transition>
    </div>
  </div>
  <Dialog :visible="confirmChangeImageDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span>ไม่สามารถทำรายการได้ มีการบันทึกรูปนี้อยู่ </span>
    </div>
    <template #footer>
      <Button label="No" icon="pi pi-times" class="p-button-text" @click="confirmChangeImageDialog = false" />
    </template>
  </Dialog>
</template>
<style>
.p-image-preview {
  transition: transform 0.15s;
  max-width: 80vw;
  max-height: 80vh;
}

.p-galleria-item-container {
  position: relative;
  display: flex;
  height: 100%;
}

.p-galleria-item-wrapper {
  display: flex;
  flex-direction: column;
  position: relative;
}

.p-galleria-item-container {
  position: relative;
  display: flex;
  height: 100%;
}

.p-galleria-item-nav {
  position: absolute;
  top: 50%;
  margin-top: -0.5rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.p-galleria-item-prev {
  left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.p-galleria-item-next {
  right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.p-galleria-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.p-galleria-item-nav-onhover .p-galleria-item-nav {
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.p-galleria-item-nav-onhover .p-galleria-item-wrapper:hover .p-galleria-item-nav {
  pointer-events: all;
  opacity: 1;
}

.p-galleria-item-nav-onhover .p-galleria-item-wrapper:hover .p-galleria-item-nav.p-disabled {
  pointer-events: none;
}

/* Indicators */
.p-galleria-indicators {
  display: flex;
  align-items: center;
  justify-content: center;
}

.p-galleria-indicator>button {
  display: inline-flex;
  align-items: center;
}

.p-galleria-indicators-left .p-galleria-item-wrapper,
.p-galleria-indicators-right .p-galleria-item-wrapper {
  flex-direction: row;
  align-items: center;
}

.p-galleria-indicators-left .p-galleria-item-container,
.p-galleria-indicators-top .p-galleria-item-container {
  order: 2;
}

.p-galleria-indicators-left .p-galleria-indicators,
.p-galleria-indicators-top .p-galleria-indicators {
  order: 1;
}

.p-galleria-indicators-left .p-galleria-indicators,
.p-galleria-indicators-right .p-galleria-indicators {
  flex-direction: column;
}

.p-galleria-indicator-onitem .p-galleria-indicators {
  position: absolute;
  display: flex;
}

.p-galleria-indicator-onitem.p-galleria-indicators-top .p-galleria-indicators {
  top: 0;
  left: 0;
  width: 100%;
  align-items: flex-start;
}

.p-galleria-indicator-onitem.p-galleria-indicators-right .p-galleria-indicators {
  right: 0;
  top: 0;
  height: 100%;
  align-items: flex-end;
}

.p-galleria-indicator-onitem.p-galleria-indicators-bottom .p-galleria-indicators {
  bottom: 0;
  left: 0;
  width: 100%;
  align-items: flex-end;
}

.p-galleria-indicator-onitem.p-galleria-indicators-left .p-galleria-indicators {
  left: 0;
  top: 0;
  height: 100%;
  align-items: flex-start;
}

/* FullScreen */
.p-galleria-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.p-galleria-close {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.p-galleria-mask .p-galleria-item-nav {
  position: fixed;
  top: 50%;
  margin-top: -0.5rem;
}

/* Animation */
.p-galleria-enter-active {
  transition: all 150ms cubic-bezier(0, 0, 0.2, 1);
}

.p-galleria-leave-active {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.p-galleria-enter-from,
.p-galleria-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

.p-galleria-enter-active .p-galleria-item-nav {
  opacity: 0;
}

/* Keyboard Support */
.p-items-hidden .p-galleria-thumbnail-item {
  visibility: hidden;
}

.p-items-hidden .p-galleria-thumbnail-item.p-galleria-thumbnail-item-active {
  visibility: visible;
}



#zoom {
  padding: 20px;
  width: 100%;
  height: 100%;
  transform-origin: 0px 0px;
  transform: scale(1) translate(0px, 0px);
  cursor: grab;


}

div#zoom>img {
  width: 100%;
  height: auto;

}
</style>
