<script type="ts" setup>
import { inject, onMounted, onBeforeUnmount, ref } from "vue";
import PathButton from "@/components/pathsModal.vue";
import { saveAs } from "file-saver";
const request = inject("request");
import { useToast } from "primevue/usetoast";
const toast = useToast();
import { useConfirm } from "primevue/useconfirm";
const confirm = useConfirm();

// Fetch the latest data once the page loads or on redirect
onMounted(fetchData);
onBeforeUnmount(() => {
  interval.clearListener();
  interval = null;
});

// Having this as a function allows it be called using a button or via onMounted
const files = ref([]);
let interval = null;
async function fetchData() {
  const data = await request.get("/fetch");
  if (!data.success)
    return toast.add({
      severity: "error",
      life: 5000,
      summary: "Fetching files failed",
      detail: data.message,
    });

  // Sort the data to something the TreeTable can understand
  files.value = data.data.map((item) => ({
    key: item.name,
    data: {
      name: item.metadata.name,
      uriID: item.uriID,
      crated: item.metadata.created,
      type: item.type,
    },
  }));

  if (!interval) {
    interval = setInterval(() => {
      fetchData();
    }, 5000);
  }
}

const URL =
  process.env.NODE_ENV === "production"
    ? "some production uri"
    : "http://localhost:8000/v/";

async function Share(uriID) {
  navigator.clipboard.writeText(URL + uriID);
  return toast.add({
    severity: "success",
    life: 5000,
    summary: "Copied to clipboard",
    detail: "Share this link with your friends",
  });
}

async function Download(uriID, name) {
  await saveAs(URL + uriID + ".mp4", name);
  return toast.add({
    severity: "success",
    life: 5000,
    summary: "Downloaded summary",
    detail: "File is downloading to the set destination",
  });
}

async function Delete(event, key) {
  confirm.require({
    target: event.currentTarget,
    message: "Are you sure you want to delete this file?",
    icon: "pi pi-exclamation-triangle",
    accept: async () => {
      const file = files.value.find((item) => item.key === key);
      if (!file) return;
      const data = await request.post("/delete", { key });
      if (!data.success)
        return toast.add({
          severity: "error",
          life: 5000,
          summary: "Deleting file failed",
          detail: data.message || "Server offline or Unknown error occured",
        });

      files.value = files.value.filter((item) => item.key !== key);
      return toast.add({
        severity: "success",
        life: 5000,
        summary: "Deleted file",
        detail: "File has been deleted successfully",
      });
    },
  });
}
</script>

<template>
  <!-- Adding folloowing properties ensures table can fit to screen -->
  <TreeTable
    :value="files"
    class="p-treetable-sm"
    :scrollable="true"
    scrollHeight="90vh"
  >
    <template #header>
      <!-- Rather than using the header for text,
       changing path and refresh buttons can be use instead -->
      <div class="space-between">
        <PathButton />
        <Button
          icon="pi pi-refresh"
          class="p-button-rounded p-button-text p-button-lg nd"
          @click="fetchData"
        />
      </div>
    </template>
    <Column>
      <!-- Fetch Data only for that specific row -->
      <template #body="{ node: { data, key } }">
        <!-- Apply correct icon specified from the database - file/folder -->
        <i
          :class="`pi pi-${data.type}`"
          style="color: var(--secondary); margin-right: 5px"
        ></i>
        <h4 style="margin: 0">{{ data.name }}</h4>

        <!-- Adding buttons that are moved to the end of the row -->
        <div class="column-end">
          <Button
            icon="pi pi-share-alt"
            class="p-button-rounded p-button-text column-button"
            @click="Share(data.uriID)"
          />
          <Button
            icon="pi pi-download"
            class="p-button-rounded p-button-text column-button"
            @click="Download(data.uriID, data.name)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-text column-button"
            @click="Delete($event, key)"
          />
        </div>
      </template>
    </Column>
    <template #empty>
      <div class="center">
        <div class="inner">
          <h1>Appears there is NO content</h1>
          <h2>Try adding a path and adding a file to it</h2>
        </div>
      </div>
    </template>
  </TreeTable>
</template>

<style>
.center {
  font-family: arial;
  width: 100%;
  height: 70vh;
  margin: 25px;
  position: relative;
  text-align: center;
}

.center .inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.inner h2 {
  width: 200px;
  margin-left: 50px;
}

.column-end {
  margin-left: auto;
  margin-right: 0;
}

.column-button {
  /* Overwrite default button styles */
  margin: -5px;
}

.space-between {
  display: flex;
  justify-content: space-between;
}

.space-between:last-child {
  margin-right: 10px;
}
</style>