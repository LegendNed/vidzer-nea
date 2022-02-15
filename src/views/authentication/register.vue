<template>
  <div class="center-screen">
    <div class="form" style="height: 290px">
      <h2>Authenticate</h2>
      <div class="input">
        <h3>Token</h3>
        <InputText
          style="width: 100%; height: 35px"
          readonly
          :placeholder="$route.query.hwid"
        />
      </div>
      <InputText
        style="width: 100%; height: 35px; margin-top: -5px"
        placeholder="Username"
        v-model="username"
      />
      <h2 style="margin-top: 5px">Security Questions</h2>
      <Dropdown
        v-model="questionID"
        :options="secQuestions"
        placeholder="Select a Security Question"
        class="dropdown"
      />
      <InputText
        style="width: 100%; height: 35px"
        placeholder="Security Question Answer"
        v-model="questionAnswer"
      />
      <Button label="Register" class="p-button-sm button" @click="submit" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import secQuestions from "../../util/secQuestion.json";
import { inject, ref } from "vue";
const request: any = inject("request");

import { useRouter } from "vue-router";
const router = useRouter();

import { useToast } from "primevue/usetoast";
const toast = useToast();

const questionID = ref("");
const questionAnswer = ref("");
const username = ref("");

const submit = async () => {
  let hwid = window.ipc.send("application", { action: "hwid" });
  if (!hwid)
    return toast.add({
      severity: "error",
      life: 5000,
      summary: "HWID not found",
      detail:
        "Failed to obtain your machine's HWID, ensure you are not using a spoofer",
    });

  if (!secQuestions.includes(questionID.value))
    return toast.add({
      severity: "error",
      life: 5000,
      summary: "Invalid Security Question",
      detail: "Please select a valid security question",
    });

  if (!questionAnswer.value.length)
    return toast.add({
      severity: "error",
      life: 5000,
      summary: "Invalid Security Question Answer",
      detail: "Please enter a valid security question answer",
    });

  if (username.value.length < 3)
    return toast.add({
      severity: "error",
      life: 5000,
      summary: "Invalid Username",
      detail: "Please enter a valid username, at least 3 characters",
    });

  let { success, msg, data } = await request.post("/auth/register/complete", {
    hwid: hwid,
    username: username.value,
    secQuestionId: secQuestions.indexOf(questionID.value),
    secQuestionAnswer: questionAnswer.value,
  });

  if (!success)
    return toast.add({
      severity: "error",
      life: 5000,
      summary: "Registration failed",
      detail: msg,
    });

  await window.keytar.set(data);
  await request.init();
  return router.push({ name: "Home" });
};
</script>

<style scoped>
.dropdown {
  width: 100%;
  margin-bottom: 5px;
}

/* Overwrite default buttons */
.button {
  width: 100%;
  margin-top: 5px;
  background-color: #0d306d;
  border: none;
}
</style>
