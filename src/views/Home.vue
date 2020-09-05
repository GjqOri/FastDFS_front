<template>
  <div>
    <manually-upload-file />
  </div>
</template>

<script>
import ManuallyUploadFile from "@/components/ManuallyUploadFile";

export default {
  name: "Home",
  data() {
    return {
      messageType: -1
    };
  },
  components: {
    ManuallyUploadFile
  }
};
</script>
