<template>
  <div class="clearfix">
    <a-upload
      :file-list="fileList"
      :remove="handleRemove"
      :before-upload="beforeUpload"
      :multiple="true"
    >
      <a-button style="margin-right: 10px;">
        <a-icon type="upload" />
        选择文件
      </a-button>
      <!-- 阻止单击事件继续传播, 使用@click.stop -->
      <a-button
        type="primary"
        :disabled="fileList.length === 0"
        :loading="uploading"
        @click.stop="handleUpload"
        style="margin-top: 16px;"
      >
        {{ uploading ? "上传中..." : "开始上传" }}
      </a-button>
    </a-upload>
  </div>
</template>

<script>
import axios from "axios";

const key = "updatable";

export default {
  name: "ManuallyUpload",
  data() {
    return {
      fileList: [],
      uploading: false
    };
  },
  props: {
    toUpdate: { type: Function, required: false, default: null }
  },
  methods: {
    /* 这两个函数是对文件数组的操作，不需要改 */
    handleRemove(file) {
      const index = this.fileList.indexOf(file);
      const newFileList = this.fileList.slice();
      newFileList.splice(index, 1);
      this.fileList = newFileList;
    },
    beforeUpload(file) {
      this.fileList = [...this.fileList, file];
      return false;
    },
    /* 表单内容上传的实现 */
    handleUpload() {
      // 封装表单数据
      const formData = new FormData();
      formData.append("reqId", 1);
      this.fileList.forEach(file => {
        formData.append("documents", file);
      });
      // Message
      this.uploading = true;
      this.$message.loading({ content: "请稍等...", key });
      // 向后端发送上传文件请求
      axios
        .post("/reqdoc/upload", formData)
        .then(response => {
          this.fileList = [];
          this.uploading = false;
          this.$message.success({ content: response.data, key });
          if (this.toUpdate !== null) {
            this.toUpdate();
          }
        })
        .catch(error => {
          this.uploading = false;
          this.$message.error({ content: error.message, key });
        });
    }
  }
};
</script>
