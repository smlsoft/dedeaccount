<template>
  <div class="flex justify-content-between m-1">
    <div>
      <ToggleButton
        v-model="modelMoveImage"
        onLabel="MoveImage"
        offLabel="MoveImage"
        onIcon="pi pi-times"
        offIcon="pi pi-arrows-alt"
        class="p-button-outlined mr-2"
        @change="moveImage()"
      />

      <ToggleButton
        v-model="modelMoveObject"
        onLabel="MoveOject"
        offLabel="MoveOject"
        onIcon="pi pi-times"
        offIcon="pi pi-arrows-alt"
        class="p-button-outlined mr-2"
        @change="moveOject()"
      />

      <Button
        icon="pi pi-replay"
        label=""
        class="p-button-outlined mr-2"
        @click="undo()"
      />
      <Button
        icon="pi pi-refresh"
        label=""
        class="p-button-outlined mr-2"
        @click="redo()"
      />
      <ToggleButton
        v-model="modelDrawingMode"
        onLabel=""
        offLabel=""
        onIcon="pi pi-times"
        offIcon="pi pi-pencil"
        class="p-button-outlined mr-2"
        @change="drawingMode()"
      />

      <Button
        label="TEXT"
        class="p-button-outlined mr-2"
        @click="addObjIText()"
      />
      <Button
        icon="pi pi-stop"
        class="p-button-outlined mr-2"
        @click="addObjRect()"
      />
      <Button
        icon="pi pi-circle-off"
        class="p-button-outlined mr-2"
        @click="addObjCircle()"
      />
      <Button
        icon="pi pi-arrow-up-right"
        class="p-button-outlined mr-2"
        @click="addObjArrow()"
      />
      <Button
        icon="pi pi-trash"
        label=""
        class="p-button-outlined mr-2 p-button-danger"
        @click="removeObj()"
      />
    </div>
    <div>
      <Button
        label="Save"
        class="p-button-outlined p-button-success"
        @click="saveImage()"
      />
    </div>
  </div>
  <div class="zoom_outer" style="background-color: #ffffff">
    <div
      id="zoom"
      :style="zoomStyle"
      @mousedown="selectedMode == 'move' ? onmousedown($event) : ''"
      @mouseup="selectedMode == 'move' ? onmouseup($event) : ''"
      @mousemove="selectedMode == 'move' ? onmousemove($event) : ''"
      @wheel="selectedMode == 'move' ? onwheel($event) : ''"
    >
      <canvas id="canvas" :style="{ width: '100%', height: 'auto' }"></canvas>
      <!-- <img :src="uri" alt="zoom" :style="{ width: '100%', height: 'auto' }" /> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fabric } from "fabric";
import $ from "jquery";

const selectedMode = ref("");

const canvas = ref(null);
const isDrawingMode = ref(false);
const dataURL = ref(null);
const objItext = ref(null);
const objRect = ref(null);
const objCircle = ref(null);
const objArrow = ref(null);
const isRedoing = ref(false);
const history = ref([]);

const modelMoveImage = ref(false);
const modelMoveObject = ref(false);
const modelDrawingMode = ref(false);

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

  initCanvas(uri.value);
  canvas.value.on("object:added", () => {
    if (!isRedoing.value) {
      history.value = [];
    }
    isRedoing.value = false;
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "Delete") {
      if (canvas.value.getActiveObject() != null) {
        removeObj();
      }
    }
  });
});

function initCanvas(uri) {
  canvas.value = new fabric.Canvas("canvas");
  canvas.value.history = [];
  canvas.value.setWidth(document.body.scrollWidth);
  canvas.value.setHeight(document.body.scrollHeight);

  fabric.Image.fromURL(uri, (image) => {
    image._element.crossOrigin = "anonymous";

    setTimeout(() => {
      canvas.value.setBackgroundImage(
        image,
        canvas.value.renderAll.bind(canvas.value),
        {
          width: canvas.value.width,
          height: canvas.value.height,
          left: canvas.value.width / 2 - image.width / 2,
          top: 0,
        }
      );
    }, 500);
  });
}

function moveImage() {
  if (modelMoveImage.value) {
    modelMoveObject.value = false;
    modelDrawingMode.value = false;
    selectedMode.value = "move";
    isDrawingMode.value = false;
    canvas.value.isDrawingMode = isDrawingMode.value;
  } else {
    modelMoveObject.value = true;
    selectedMode.value = "drawing";
  }
}

function moveOject() {
  if (modelMoveObject.value) {
    modelMoveImage.value = false;
    modelDrawingMode.value = false;
    selectedMode.value = "drawing";
    isDrawingMode.value = false;
    canvas.value.isDrawingMode = isDrawingMode.value;
  } else {
    modelMoveImage.value = true;
    selectedMode.value = "move";
  }
}

function drawingMode() {
  if (modelDrawingMode.value) {
    modelMoveObject.value = false;
    modelMoveImage.value = false;

    selectedMode.value = "drawing";
    isDrawingMode.value = !isDrawingMode.value;
    canvas.value.isDrawingMode = isDrawingMode.value;
    canvas.value.freeDrawingBrush.color = "red";
    canvas.value.freeDrawingBrush.width = 3;
  }
}

function undo() {
  if (canvas.value._objects.length > 0) {
    history.value.push(canvas.value._objects.pop());
    canvas.value.renderAll();
  }
}
function redo() {
  if (history.value.length > 0) {
    isRedoing.value = true;
    canvas.value.add(history.value.pop());
  }
}

function addObjIText() {
  addObjMode();

  objItext.value = new fabric.IText("กรุณาป้อนข้อความ", {
    left: 200,
    top: 200,
    fontSize: 30,
    fill: "white",
    backgroundColor: "red",
    padding: 10,
  });

  canvas.value.add(objItext.value);
}

function addObjRect() {
  addObjMode();

  objRect.value = new fabric.Rect({
    left: 200,
    top: 200,
    width: 200,
    height: 80,
    fill: "",
    stroke: "red",
    strokeWidth: 3,
    padding: 10,
    noScaleCache: false,
    strokeUniform: true,
  });

  canvas.value.add(objRect.value);
  canvas.value.renderAll();
}

function addObjCircle() {
  addObjMode();

  objCircle.value = new fabric.Circle({
    left: 200,
    top: 200,
    radius: 40,
    fill: "",
    stroke: "red",
    strokeWidth: 3,
    padding: 10,
    noScaleCache: false,
    strokeUniform: true,
  });

  // Render the circle in canvas
  canvas.value.add(objCircle.value);
}

function addObjArrow() {
  addObjMode();

  drawShape(canvas.value, "arrow");
}

function addObjMode() {
  selectedMode.value = "drawing";
  modelMoveObject.value = true;
  modelMoveImage.value = false;
  modelDrawingMode.value = false;
  isDrawingMode.value = false;
  canvas.value.isDrawingMode = isDrawingMode.value;
}

function drawShape(canvas, shape) {
  let selectedShape;
  let pointer, startX, startY, origX, origY;
  let rect, ellipse, line, triangle, arrow;

  let stroke = "red";
  let fill = "red";

  /* previous shape will not be drawn (fix) */
  canvas.off("mouse:down");
  canvas.off("mouse:up");

  canvas.on("mouse:down", function (option) {
    if (option.target != null) {
      return;
    } else {
      switch (shape) {
        case "arrow":
          pointer = canvas.getPointer(option.e);
          let arrowLinePoints = [pointer.x, pointer.y, pointer.x, pointer.y];

          startX = pointer.x;
          startY = pointer.y;

          line = new fabric.Line(arrowLinePoints, {
            fill: fill,
            stroke: stroke,
            strokeWidth: 3,
          });

          // reference points for arrowhead
          origX = line.x2;
          origY = line.y2;

          let dx = line.x2 - line.x1,
            dy = line.y2 - line.y1;

          /* calculate angle of arrow */
          let angle = Math.atan2(dy, dx);
          angle *= 180 / Math.PI;
          angle += 90;

          arrow = new fabric.Triangle({
            angle: angle,
            fill: fill,
            top: line.y2,
            left: line.x2,
            width: 15,
            height: 15,
            originX: "center",
            originY: "center",
            stroke: stroke,
          });

          break;
      }

      canvas.add(line);
      canvas.add(arrow);
      canvas.renderAll();

      canvas.on("mouse:move", function (option) {
        switch (shape) {
          case "arrow":
            pointer = canvas.getPointer(option.e);

            line.set({
              x2: pointer.x,
              y2: pointer.y,
            });

            let dx = line.x2 - line.x1,
              dy = line.y2 - line.y1;

            let angle = Math.atan2(dy, dx);
            angle *= 180 / Math.PI;
            angle += 90;

            arrow.set({
              top: line.y2,
              left: line.x2,
              angle: angle,
              width: 20,
              height: 20,
            });

            canvas.renderAll();

            break;
        }
      });
    }
  });

  canvas.on("mouse:up", function (option) {
    canvas.off("mouse:move");
    canvas.off("mouse:down");
    canvas.off("mouse:up");
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    canvas.remove(line);
    canvas.remove(arrow);
    objArrow.value = new fabric.Group([line, arrow], {
      hasBorders: true,
      hasControls: true,
    });
    canvas.add(objArrow.value);
  });
}

function removeObj() {
  if (!modelMoveObject.value) {
    return;
  } else {
    console.log(canvas.value.getActiveObject()._objects);
    if (canvas.value.getActiveObject()._objects == undefined) {
      canvas.value.remove(canvas.value.getActiveObject());
    } else {
      console.log(canvas.value.getActiveObject().type);
      if (canvas.value.getActiveObject().type == "group") {
        canvas.value.remove(canvas.value.getActiveObject());
        canvas.value.discardActiveObject();
        canvas.value.requestRenderAll();
      } else {
        canvas.value.getActiveObject()._objects.forEach((element) => {
          canvas.value.remove(element);
        });
      }
    }
  }
}

function saveImage() {
  var dataUrl = canvas.value.toDataURL({ format: "jpeg", quality: 0.8 });
  dataURL.value = dataUrl;

  var resizedImage = dataURLToBlob(dataUrl);
  $.event.trigger({
    type: "imageResized",
    blob: resizedImage,
    url: dataUrl,
  });

  var newfile = createFile(resizedImage);
  console.log(newfile);

  // ปริ้นดูรูป
  var w = window.open("", "");
  w.document.write("<html><head>");
  w.document.write("</head><body >");
  w.document.write(
    '<img id="print-image-element" src="' +
      newfile.objectURL +
      '" width="100%"/>'
  );
  w.document.write(
    '<script>var img = document.getElementById("print-image-element"); img.addEventListener("load",function(){ window.focus(); window.print(); window.document.close(); window.close(); }); <//script>'
  );
  w.document.write("</body></html>");
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
  cursor: move !important;
}
div#zoom > img {
  width: 100%;
  height: auto;
}
</style>
