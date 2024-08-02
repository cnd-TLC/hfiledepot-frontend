<script setup>
  import { ref } from 'vue'
  import { useDropzone } from 'vue3-dropzone'
  import { apiEndPoint } from '@/constant/data'
  import { UploadFilled } from '@element-plus/icons-vue'
  import axios from 'axios'

  const emit = defineEmits(['fileUploaded'])

  const props = defineProps({
    data: Object,
    type: String
  })

  const loading = ref(true)

  // dropzone
  const isDragActive = ref(false)
  const uploadUrl = apiEndPoint + '/api/import_files/'+ props.type +'/' + props.data.id
  const uploadedItem = ref()
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

  const saveFiles = (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('attachments[]', files[i])
    }
    // loading.value = true
    axios.post(uploadUrl, formData, {
      headers: {
      'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => {
      console.info(res.data.message)
      emit('fileUploaded')
    })
    .catch((err) => {
      console.error(err);
    });
  }


  const onDrop = (acceptedFiles, rejectedFiles) => {
    saveFiles(acceptedFiles)
    // console.log(acceptedFiles)
    // console.log(rejectedFiles)
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    onDragEnter: () => {
      isDragActive.value = true
      textColor.value = 'primary'
      iconColor.value = '#409eff' 
    },
    onDragLeave: () => {
      isDragActive.value = false
      textColor.value = 'info'
      iconColor.value = '#909399' 
    },
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
        <el-text :type="textColor">Drag file here, or click to <el-text type="primary"> select a file </el-text></el-text>
      </div>
    </div>
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
</style>