<script setup></script>
<template>
  <div class="p-3 flex flex-column flex-auto main-div" id="maincontainer">
    <slot></slot>
  </div>
</template>
<style>
.main-div {
  height: 96vh;
  overflow-y: auto;
  position: relative;
  contain: paint;
}

/* ป้องกันการเลื่อนของหน้าจออัตโนมัติเมื่อมีการเปลี่ยนแปลงใน DOM */
#maincontainer {
  scroll-behavior: auto;
}
</style>