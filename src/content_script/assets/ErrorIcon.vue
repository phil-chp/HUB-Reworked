<template>
  <!-- https://iconscout.com/icons/error -->
  <div class="error-hint">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="error-icon-hub">
      <path
        d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm4.242,14.829a1,1,0,0,1,0,1.414,1.026,1.026,0,0,1-1.414,0L12,13.414,9.172,16.243a1.01,1.01,0,0,1-1.414,0,1,1,0,0,1,0-1.414L10.586,12,7.758,9.171A1,1,0,1,1,9.172,7.757L12,10.586l2.828-2.829a1,1,0,1,1,1.414,1.414L13.414,12Z"
        fill="#eb4034"
      ></path>
    </svg>
    <span class="error-hint-text">{{ props.hintMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  hintMessage: {
    type: String,
    default: "Error."
  }
});
</script>

<style scoped>
.error-icon-hub {
  height: 15px;
  width: 15px;
  margin: 1px;
  cursor: pointer;
}

.error-hint {
  position: relative;
}

.error-hint .error-hint-text {
  visibility: hidden;
  width: 200px;
  background-color: #272727;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  top: 100%;
  left: 50%;
  margin-left: -100px;
  opacity: 0;
  transition: opacity 250ms;
}

.error-hint:hover .error-hint-text {
  visibility: visible;
  opacity: 1;
}</style>
