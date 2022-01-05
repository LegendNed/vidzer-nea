<template>
  <div class="container">
    <div class="navbar"></div>
    <div class="exit">
      <Button
        icon="pi pi-minus"
        class="p-button-rounded p-button-text p-button-lg nd"
        @click="minimize"
      />
      <Button
        icon="pi pi-times"
        class="p-button-rounded p-button-text p-button-lg nd"
        @click="close"
      />
    </div>
    <div class="content"><router-view /></div>
    <div class="footer">
      <h3>Copyright &copy; 2021-2022 Ned (Under CC0)</h3>
      <a href="http://github.com/LegendeNed"><h3>Github Page</h3></a>
    </div>
  </div>
</template>

<script lang="ts" setup>
const minimize = () => {
  window.ipc.send("application", { action: "minimize" });
};

const close = () => {
  window.ipc.send("application", { action: "close" });
};
</script>