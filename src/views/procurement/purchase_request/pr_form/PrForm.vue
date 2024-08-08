<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import type { FormProps } from 'element-plus'
	import { useRouter } from 'vue-router'
	import { apiEndPoint } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const router = useRouter()

	const props = defineProps({
		update: Boolean,
		data: Object
	})

	const pr_id = ref(0)

	const labelPosition = ref<FormProps['labelPosition']>('top')
	const emit = defineEmits(['updateButtonIsClicked'])

	const prFormData = reactive({
		purpose_of_request: '',
		department: '', 
		pr_no: '', 
		created_at: '', 
		section: '', 
		fpp: '', 
		fund: '', 
		purpose: '',
	})

	const sendPrButtonIsDisabled = ref(true)

	const sendPrForm = async (formType: String) => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			sendPrButtonIsDisabled.value = true
			if (formType === 'submit'){
				await axios.post(apiEndPoint + '/api/add_pr', { 
					purpose: prFormData.purpose,
				}).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
					pr_id.value = res.data.id
					router.push({ name: 'request_items', params: { 
						id: res.data.id, 
						department: res.data.department,
						requested_by: res.data.requested_by,
						status: res.data.status,
					} })
				})
			}
			else{
				await axios.put(`${apiEndPoint}/api/update_pr/${props.data.id}`, { 
					// pr_no: prFormData.pr_no, 
					// section: prFormData.section, 
					// fpp: prFormData.fpp, 
					// fund: prFormData.fund, 
					purpose: prFormData.purpose
				}).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
				})
				emit('updateButtonIsClicked')
			}
		}
		catch (err) {
			ElMessage({
				message: `Cannot submit form: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			sendPrButtonIsDisabled.value = false
		}
	}

	onMounted(() => {
		if (props.update){
			prFormData.purpose = props.data.purpose
		}
		sendPrButtonIsDisabled.value = false
	})
</script>

<template>
 	<el-form :model="prFormData" label-width="auto" :label-position="labelPosition">
	    <el-form-item label="Purpose of Request">
	      	<el-input v-model="prFormData.purpose" :autosize="{minRows: 3}" type="textarea" />
	    </el-form-item>
	    <el-button v-if="props.update" size="large" class="submit-width" type="warning" @click="sendPrForm('update')" :disabled="sendPrButtonIsDisabled"> Update </el-button> 
	    <el-button v-else size="large" class="submit-width" type="success" @click="sendPrForm('submit')" :disabled="sendPrButtonIsDisabled"> Send </el-button> 
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