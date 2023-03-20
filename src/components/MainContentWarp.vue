<script setup></script>
<template>
  <div class="p-3 flex flex-column flex-auto main-div" id="maincontainer">
    <slot></slot>
  </div>
</template>
<style>
.main-div {
  height: 95vh;
  overflow-y: scroll;
}
</style>
