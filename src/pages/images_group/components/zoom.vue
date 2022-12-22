<template>
  <div class="zoom_outer" style="background-color: black">
    <div
      id="zoom"
      :style="zoomStyle"
      @mousedown="onmousedown($event)"
      @mouseup="onmouseup($event)"
      @mousemove="onmousemove($event)"
      @wheel="onwheel($event)"
    >
      <img :src="uri" alt="zoom" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const scale = ref(1);
const panning = ref(false);
const pointX = ref(0);
const pointY = ref(0);
const start = ref({ x: 0, y: 0 });
const zoomStyle = ref("");
const uri = ref("");

onMounted(() => {
  let params = location.href.split("?")[1].split("&");
  let data = {};
  let x = 0;
  for (x in params) {
    data[params[x].split("=")[0]] = params[x].split("=")[1];
  }

  uri.value = data.uri;
});

function setTransform() {
  zoomStyle.value =
    "transform:translate(" +
    pointX.value +
    "px, " +
    pointY.value +
    "px) scale(" +
    scale.value +
    ")";
  //console.log(zoomStyle.value);
}

function onmousedown(e) {
 // console.log(e);
  e.preventDefault();
  start.value = { x: e.clientX - pointX.value, y: e.clientY - pointY.value };
  panning.value = true;
}

function onmouseup(e) {
  panning.value = false;
}

function onmousemove(e) {
  e.preventDefault();

  if (!panning.value) {
    return;
  }
  pointX.value = e.clientX - start.value.x;
  pointY.value = e.clientY - start.value.y;

  setTransform();
}

function onwheel(e) {
  e.preventDefault();

  var xs = (e.clientX - pointX.value) / scale.value;
  var ys = (e.clientY - pointY.value) / scale.value;
  var delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;

  //console.log("delta : " + delta);

  delta > 0 ? (scale.value *= 1.2) : (scale.value /= 1.2);
  pointX.value = e.clientX - xs * scale.value;
  pointY.value = e.clientY - ys * scale.value;

  //console.log("x : " + pointX.value);
  //console.log("y : " + pointY.value);

  setTransform();
}
</script>

<style>
.zoom_outer {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

#zoom {
  width: 100%;
  height: 100%;
  transform-origin: 0px 0px;
  transform: scale(1) translate(0px, 0px);
  cursor: grab;
}
div#zoom > img {
  width: 100%;
  height: auto;
}
</style>
