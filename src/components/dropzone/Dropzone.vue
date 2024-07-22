<script setup>
  import { ref, onMounted } from 'vue'
  import { useDropzone } from 'vue3-dropzone'
  import { apiEndPoint } from '@/constant/data'
  import { UploadFilled, Close, Document } from '@element-plus/icons-vue'
  import axios from 'axios'

  const emit = defineEmits(['attachmentUpdated'])

  const props = defineProps({
    data: Object,
    type: String
  })

  const loading = ref(true)

  // dropzone
  const isDragActive = ref(false)
  const uploadUrl = apiEndPoint + '/api/add_attachments/'+ props.type +'/' + props.data.id
  const fetchUrl = apiEndPoint + '/api/get_attachments/' + props.type + '/' + props.data.id
  const downloadUrl = apiEndPoint + '/api/download_attachment/'
  const deleteUrl = apiEndPoint + '/api/remove_attachment/'
  const uploadedItems = ref([])
  const textColor = ref('info')
  const iconColor = ref('#909399')

  const generateRandomString = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let randomString = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        randomString += charset[randomIndex]
    }
    return randomString
  }

  const fetchUploadedItems = () => {
    axios.get(fetchUrl)
    .then((response) => {
      uploadedItems.value = response.data.attachments
      emit('attachmentUpdated')
      loading.value = false
    })
    .catch((err) => {
      console.error('Error fetching uploaded items:', err)
    });
  };

  const saveFiles = (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('attachments[]', files[i]);
    }
    // loading.value = true
    axios.post(uploadUrl, formData, {
      headers: {
      'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => {
      console.info(res.data.message);
      fetchUploadedItems()
    })
    .catch((err) => {
      console.error(err);
    });
  }

  const removeFile = (index) => {
    loading.value = true
    axios.delete(deleteUrl + uploadedItems.value[index]).then((res) => {
      console.log(res.data.message)
      fetchUploadedItems()
    })
  }

  const downloadFile = (index) => {
    axios.get(downloadUrl + uploadedItems.value[index], {
      responseType: 'blob'
    })
    .then((res) =>{
      const contentDisposition = res.headers['content-disposition']
      let filename = generateRandomString(20)

      const blob = new Blob([res.data], { type: res.headers['content-type'] })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  const extractFileName = (path) => {
    const startIndex = path.lastIndexOf('/') + 1
    const filename = path.substring(startIndex)
    return filename.split('~-~')[1]
  };

  const onDrop = (acceptedFiles, rejectedFiles) => {
    saveFiles(acceptedFiles);
    console.log(acceptedFiles);
    console.log(rejectedFiles);
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    onDragEnter: () => {
      isDragActive.value = true;
      textColor.value = 'primary'
      iconColor.value = '#409eff' 
    },
    onDragLeave: () => {
      isDragActive.value = false;
      textColor.value = 'info'
      iconColor.value = '#909399' 
    },
  })

  onMounted(() => {
    fetchUploadedItems();
  })
</script>

<template>
  <div >
    <div v-bind="getRootProps()" :class="{ 'center-form': true, 'on-drag-border': isDragActive, 'off-drag-border': !isDragActive }">
      <input v-bind="getInputProps()" />
      <el-icon :color="iconColor"><upload-filled /></el-icon>
      <div v-if="isDragActive">
        <el-text :type="textColor">Drop the files here</el-text>
      </div>
      <div v-else>
        <el-text :type="textColor">Drag files here, or click to <el-text type="primary"> select files </el-text></el-text>
      </div>
    </div>
    <el-skeleton animated :loading="loading">
      <template #template>
        <el-skeleton-item v-for="n in 5" variant="text" style="width: 100%" />
      </template>
      <template #default>
        <div v-if="uploadedItems != null">
          <el-row>
            <el-col :span="8" v-for="(item, index) in uploadedItems" :key="index">
              <li class="item-display">
                <div class="close-icon-area">
                  <el-icon color="red" @click="removeFile(index)"><close class="close" /></el-icon>
                </div>
                <div class="document-icon-area">
                  <el-icon class="huge-icon"><document /></el-icon>
                </div>
                <el-divider class="no-spacing"/>
                <div class="file-name">
                  <el-text @click="downloadFile(index)"> {{ extractFileName(item) }} </el-text>
                </div>
              </li>
            </el-col>
          </el-row>
          <div class="no-attachment" v-if="uploadedItems.length == 0">
            <i>
              <el-text type="info"> Accepts pdf, xslx, and docx files </el-text>
            </i>
          </div>
        </div>
        <div class="no-attachment" v-else>
          <i>
            <el-text type="info"> Accepts pdf, xslx, and docx files </el-text>
          </i>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
  .center-form {
    text-align: center;
    width: 100%;
    padding: 20px 0;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 20px;
  }

  .center-form:hover {
    border: 1px dashed #409eff;
  }

  .center-form .el-icon {
    font-size: 70px
  }

  .huge-icon {
    font-size: 50px;
  }

  .on-drag-border {
    border: 1px dashed #409eff;
  }

  .off-drag-border {
    border: 1px dashed #909399;
  }

  .item-display {
    display: block;
    /*justify-content: center;
    align-items: center;*/
    list-style-type: none;
    padding: 0 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 4px 4px;
    height: auto  ;
    word-wrap: break-word;
  }

  .item-display .document-icon-area {
    padding: 0 0 10px 0;
    text-align: center;
    background-color: rgb(240, 240, 240);
  }

  .no-spacing {
    margin: 0;
  }

  .file-name {
    margin: 5px 10px;
  }

  .file-name .el-text:hover {
    text-decoration: underline;
    color: #409eff;
    cursor: pointer;
  }

  .close {
    cursor: pointer;
  }

  .item-display .close:hover {
    font-size: 15px;
  }

  .item-display .close-icon-area {
    width: 100%;
    padding: 6px 7px;
    text-align: right;
    background-color: rgb(240, 240, 240);
  }  

  .no-attachment {
    text-align: center;
    margin-bottom: 10px;
  }

  .no-attachment .el-text {
    font-size: 12px;
  }
</style>