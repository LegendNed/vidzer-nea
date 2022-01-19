<template>
  <Button label="Edit paths" @click="changeState" />
  <Dialog
    v-model:visible="open"
    :modal="true"
    :breakpoints="{ '760px': '90vw' }"
    :showHeader="true"
    :scrollable="true"
  >
    <template #header>
      <h3 style="margin: 0">Click folder icon to update/edit Directory</h3>
    </template>
    <DataTable
      class="p-datatable-sm"
      :value="paths"
      responsiveLayout="scroll"
      @cell-edit-complete="editName"
      editMode="cell"
    >
      <Column
        field="name"
        header="Name (Click to Edit)"
        headerStyle="width: 25%"
      >
        <template #editor="{ data: path, field }">
          <!-- Using if and else statement to allow users
           to edit name of Path or not-->
          <InputText
            style="width: 100%"
            v-model="path[field]"
            v-if="!path.add"
            autofocus
          />
          <span v-else>{{ path[field] }}</span>
        </template>
      </Column>
      <Column field="path" header="Directory" headerStyle="width: 60%" />
      <Column headerStyle="width: 15%" style="text-align: right">
        <template #body="{ data: path }">
          <Button
            icon="pi pi-folder-open"
            class="p-button-rounded p-button-text p-button-m"
            @click="changePath(path.name)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-text p-button-m"
            @click="remove(path.name)"
            :disabled="path.add"
          />
        </template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
const toast = useToast();

const open = ref(false);
const changeState = () => {
  // Ensure latest paths are used when opened
  updatePaths();
  open.value = !open.value;
};

let paths = ref([]);
function updatePaths() {
  let data = window.ipc.send("path", { action: "get" });

  // Change path object to array of objects which DataTable can understand
  paths.value = Object.entries(data).reduce(
    (acc, cur) => [...acc, { name: cur[0], path: cur[1], add: false }],
    []
  );

  if (paths.value.length >= 4) return;

  // If array is not full, 4 values, then fill them with template objects
  // so user can add more paths
  let fillNumber = 4 - paths.value.length;
  paths.value = [
    ...paths.value,
    ...Array(fillNumber).fill({ name: "Nothing", path: "", add: true }),
  ];
}

function remove(name) {
  window.ipc.send("path", { action: "remove", name });
  updatePaths();
}

function changePath(name) {
  let path = window.ipc.send("path", { action: "directory" });

  // As path returns false, if closed or an error,
  // if statement can be used to test it
  if (!path)
    return toast.add({
      severity: "error",
      life: 5000,
      summary: "Process canceled",
      detail: "You have closed or canceled directory picking process",
    });

  // name can either be user provided name or default when no path provided
  if (name == "Nothing") {
    // Obtain last path name, for the name of new path
    // Else user can update name later
    let pathName = path.split("\\").pop();
    window.ipc.send("path", { action: "add", name: pathName, path });
  } else window.ipc.send("path", { action: "update", name, path });

  updatePaths();
}

function editName(event) {
  let { value, newValue } = event;
  // Preventing un-edited name changes to other paths
  if (value == newValue) return;

  // Validation for prior schema
  if (newValue.length == 0 || newValue.length >= 32)
    return toast.add({
      severity: "error",
      life: 5000,
      summary: "Invalid name provided",
      detail: "Can't be empty and longer than 32 characters",
    });

  window.ipc.send("path", {
    action: "update",
    name: value,
    newName: newValue,
  });
  updatePaths();
}
</script>