<template>
  <Button @click="addText()" class="mr-2">addTEXT</Button>
  <Button @click="addRect()" class="mr-2">addRect</Button>
  <Button @click="exportUri()" class="mr-2">exportUri</Button>
  <Button @click="removeObj()">DELECT</Button>
  <div>
    <canvas id="canvas"></canvas>
    <img :src="imgsrc"/>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fabric } from "fabric";
import $ from "jquery";
const canvas = ref(null);
const iText = ref(null);
const dataURL = ref(null);
const imgsrc = ref();

onMounted(() => {
  init();

  document.addEventListener("keyup", (event) => {
    if (event.key === "Delete") {
      handleDelete();
    }
  });
});

function init() {
  canvas.value = new fabric.Canvas("canvas");
  canvas.value.setWidth(document.body.scrollWidth);
  canvas.value.setHeight(document.body.scrollHeight);

  let uri =
    "https://dedeposblosstorage.blob.core.windows.net/dedeposdevcontainer/2KRg6cdEfCH3HF753VgEqamtt67/2Ktr8L6X7oxNo2CA2Xjr1k7Hxb2.jpeg";

  fabric.Image.fromURL(uri, (image) => {
    image._element.crossOrigin = 'anonymous'
    
    canvas.value.setBackgroundImage(
      image,
      canvas.value.renderAll.bind(canvas.value),
      {
        width: canvas.value.width,
        height: canvas.value.height,
        originX: "left",
        originY: "top",
      }
    );
  });
}

function handleDelete() {
  if (canvas.value.getActiveObject() != null) {
    removeObj();
  }
}

function addRect() {
  var rect = new fabric.Rect({
    top: 100,
    left: 100,
    width: 60,
    height: 70,
    fill: "red",
  });

  canvas.value.add(rect);
}

function addText() {
  iText.value = new fabric.IText("Hello World", {
    left: 100,
    top: 100,
    fontSize: 30,
    fill: "red",
  });

  canvas.value.add(iText.value);

}

function removeObj() {
  //   console.log(canvas.value.getActiveObject()._objects);
  if (canvas.value.getActiveObject()._objects == undefined) {
    canvas.value.remove(canvas.value.getActiveObject());
  } else {
    canvas.value.getActiveObject()._objects.forEach((element) => {
      canvas.value.remove(element);
    });
  }
}

function exportUri() {


var dataUrl = canvas.value.toDataURL("image/jpeg");
imgsrc.value = dataUrl;
//console.log(data)
//   dataURL.value = canvas.value;
//   console.log(dataURL.value);

//   canvas.value.setWidth(200);
//   canvas.value.setHeight(200);
  
  
  //   console.log(canvasID);

  //   var dataUrl = canvasID.toDataURL("image/jpeg");
    var resizedImage = dataURLToBlob(dataUrl);
    $.event.trigger({
      type: "imageResized",
      blob: resizedImage,
      url: dataUrl,
    });

    var newfile = createFile(resizedImage);
    console.log(newfile);
}
function dataURLToBlob(dataURL) {
  var BASE64_MARKER = ";base64,";
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var parts = dataURL.split(",");
    var contentType = parts[0].split(":")[1];
    var raw = parts[1];

    return new Blob([raw], { type: contentType });
  }

  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(":")[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

function createFile(image) {

  let newFile = new File([image], "testnewpic", {
    type: "image/png",
  });

  newFile.objectURL = URL.createObjectURL(image);
  return newFile;
}
</script>

<style scoped>
canvas {
  border: 1px solid;
}
</style>
