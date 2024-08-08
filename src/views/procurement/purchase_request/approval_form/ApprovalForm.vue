<script lang="ts" setup>
	import { reactive, ref } from 'vue'
	import type { FormProps } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const props = defineProps({
		data: Object
	})

	const labelPosition = ref<FormProps['labelPosition']>('right')
	const emit = defineEmits(['updateButtonIsClicked'])

	const prFormData = reactive({
		pr_no: props.data.pr_no,
		section: props.data.section,
		fund: props.data.fund,
		fpp: props.data.fpp,
		
	})

	const approvePrButtonIsDisabled = ref(false)

	const approvePr = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}
		}
		try{
			await axios.put(`${apiEndPoint}/api/set_approval_pr_bac/${props.data.id}`, {
					status: 'Approved',
					pr_no: prFormData.pr_no,
					section: prFormData.section,
					fund: prFormData.fund,
					fpp: prFormData.fpp,
				}).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
				})

			approvePrButtonIsDisabled.value = true
			emit('updateButtonIsClicked')
		}
		catch (err) {
			ElMessage({
				message: `Cannot approve: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			approvePrButtonIsDisabled.value = false
		}
	}
</script>

<template>
 	<el-form :model="prFormData" label-width="auto" :label-position="labelPosition">
		    <el-form-item label="PR Number">
		      	<el-input v-model="prFormData.pr_no" />
		    </el-form-item>
		    <el-form-item label="Section">
		      	<el-input v-model="prFormData.section" />
		    </el-form-item>
	    	<el-form-item label="Fund">
	     		<el-input v-model="prFormData.fund" />
	    	</el-form-item>
		    <el-form-item label="FPP">
		      	<el-input v-model="prFormData.fpp" />
		    </el-form-item>
	    <el-button v-if="props.update" size="large" class="submit-width" type="warning" @click="approvePr" :disabled="approvePrButtonIsDisabled"> Update </el-button> 
	    <el-button v-else size="large" class="submit-width" type="success" @click="approvePr" :disabled="approvePrButtonIsDisabled"> Approve </el-button> 
  	</el-form>
</template>

<style scoped>
	.submit-width {
		display: block;
		float: right;
		width: 30%;
	}

	.full-width {
		display: block;
		width: 100%;
	}

	.el-form {
		padding-bottom: 40px;
	}
</style>