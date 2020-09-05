<template>
  <div>
    <manually-upload-file
      style="margin-bottom: 16px;"
      :to-update="loadTableData"
    />
    <div style="margin-bottom: 16px;">
      <a-button
        type="danger"
        :disabled="!hasSelected"
        :loading="deleting"
        @click="deleteItems"
        icon="delete"
        style="display: inline-block;"
      >
        删除
      </a-button>
      <span style="margin-left: 8px">
        {{ `已选择 ${selectedRowKeys.length} 项` }}
      </span>
    </div>
    <a-table
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange
      }"
      :columns="columns"
      :data-source="tableData"
      :rowKey="setTableKey"
    >
      <!-- slot-scope 可以直接拿到单元格的值 -->
      <a-button
        slot="action"
        type="primary"
        icon="download"
        slot-scope="record"
        @click="downloadItem(record.docId)"
      >
        下载
      </a-button>
    </a-table>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import ManuallyUploadFile from "@/components/ManuallyUploadFile";

const columns = [
  {
    title: "名称",
    dataIndex: "docName"
  },
  {
    title: "大小",
    dataIndex: "docSize"
  },
  {
    title: "上传者",
    dataIndex: "uploadUserName"
  },
  {
    title: "上传时间",
    dataIndex: "uploadDatetime",
    defaultSortOrder: "descend",
    sorter: (a, b) =>
      moment(a.uploadDatetime).isBefore(b.uploadDatetime) === true ? -1 : 1
  },
  {
    title: "操作",
    dataIndex: "",
    scopedSlots: { customRender: "action" }
  }
];
const deleteKey = "delete";

export default {
  name: "FileDisplayTable",
  data() {
    return {
      fileList: [],
      tableData: [],
      columns,
      selectedRowKeys: [], // Check here to configure the default column
      deleting: false
    };
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0;
    }
  },
  methods: {
    loadTableData() {
      axios
        .get("/reqdoc/query/1")
        .then(response => {
          const res = response.data;
          const data = [];
          for (let i = 0; i < res.length; i++) {
            data.push({
              docId: res[i].docId,
              docName: res[i].docName,
              docSize: this.docSizeAfterConvert(res[i].docSize),
              uploadUserName: res[i].uploadUser.userName,
              uploadDatetime: res[i].uploadDatetime
            });
          }
          this.tableData = data;
        })
        .catch(error => {
          console.log(error.message);
          this.$message.error({ content: "数据加载失败" });
        });
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },
    /* 设置表格每一行的rowKey */
    setTableKey(record) {
      return record.docId;
    },
    /* 文件大小单位换算 */
    docSizeAfterConvert(docSize) {
      const oneMB = 1024 * 1024;
      const oneKB = 1024;
      if (docSize >= oneMB) {
        docSize /= oneMB;
        // 保留两位小数
        return docSize.toFixed(2) + "MB";
      } else if (docSize >= oneKB) {
        docSize /= oneKB;
        return docSize.toFixed(2) + "KB";
      } else {
        return docSize + "B";
      }
    },
    /* 删除一个或多个文件 */
    deleteItems() {
      this.deleting = true;
      let ids = [];
      this.selectedRowKeys.forEach(item => ids.push(item));
      // 封装 Params
      var params = new URLSearchParams();
      params.append("ids", ids);
      // 向后端发送删除请求
      this.$message.loading({ content: "请稍等...", key: deleteKey });
      axios
        .post("/reqdoc/delete", params)
        .then(response => {
          // Message
          this.deleting = false;
          if (response.data > 0) {
            this.$message.success({ content: "删除成功", key: deleteKey });
          } else {
            this.$message.error({ content: "删除失败", key: deleteKey });
          }
          // 数据更新
          this.tableData = this.tableData.filter(
            item => !this.selectedRowKeys.includes(item.docId)
          );
          this.selectedRowKeys = [];
        })
        .catch(() => {
          // Message
          this.deleting = false;
          this.$message.error({ content: "删除失败", key: deleteKey });
        });
    },
    /* 下载一个文件(固定写法) */
    downloadItem(docId) {
      axios
        .get("/reqdoc/download/" + docId, { responseType: "blob" })
        .then(response => {
          const { data, headers } = response;
          const contentDisposition = decodeURI(headers["content-disposition"]);
          // 正则表达式
          let re = /filename="(.*)"/;
          // 获取 filename="" 中的内容
          const fileName = re.exec(contentDisposition)[1].trim();
          let dom = document.createElement("a");
          let url = window.URL.createObjectURL(data);
          dom.href = url;
          dom.download = fileName;
          dom.style.display = "none";
          document.body.appendChild(dom);
          dom.click();
          dom.parentNode.removeChild(dom);
          // 让浏览器知道这个URL已经不再需要指向对应的文件
          window.URL.revokeObjectURL(url);
        })
        .catch(error => {
          console.log(error.message);
          this.$message.error({ content: "下载失败" });
        });
    }
  },
  mounted() {
    this.loadTableData();
  },
  components: {
    ManuallyUploadFile
  }
};
</script>

<style scoped>
.ant-table-wrapper {
  width: 60%;
}
</style>
