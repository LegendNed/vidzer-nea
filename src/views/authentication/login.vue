<template>
  <div class="center-screen">
    <div class="form">
      <h2>Authentication</h2>
      <div class="input">
        <h3>Token</h3>
        <InputText v-model="token" style="width: 100%; height: 35px" />
      </div>
      <div class="input">
        <Button
          label="Login with HWID"
          @click="login"
          class="p-button-text"
          style="width: 60%"
        />
        <Button
          label="Register"
          @click="register"
          class="p-button-text"
          style="width: 40%"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, ref } from "vue";
const request: any = inject("request");

import { useToast } from "primevue/usetoast";
const toast = useToast();

import { useRouter } from "vue-router";
const router = useRouter();

const getHwid = () => {
  let hwid = window.ipc.send("application", { action: "hwid" });
  if (!hwid) {
    toast.add({
      severity: "error",
      life: 5000,
      summary: "HWID not found",
      detail:
        "Failed to obtain your machine's HWID, ensure you are not using a spoofer",
    });
    return null;
  }

  return hwid;
};

const token = ref("");
const login = async () => {
  let hwid = getHwid();
  if (!hwid) return;

  let { success, msg, data } = await request.post("/auth/login", {
    hwid: hwid,
    token: token.value,
  });

  if (!success)
    return toast.add({
      severity: "error",
      life: 5000,
      summary: "Login failed",
      detail: msg,
    });

  await window.keytar.set(data);
  return router.push({ name: "Home" });
};

const register = async () => {
  let hwid = getHwid();
  if (!hwid) return;

  let { success, msg } = await request.post("/auth/register/check", {
    hwid: hwid,
    token: token.value,
  });

  if (!success)
    return toast.add({
      severity: "error",
      life: 5000,
      summary: "Register failed",
      detail: msg,
    });

  return router.push({ name: "Register", query: { hwid } });
};
</script>