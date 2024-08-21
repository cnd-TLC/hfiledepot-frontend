<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import type { FormProps, FormInstance, FormRules } from 'element-plus'
	import { useRouter } from 'vue-router'
	import { apiEndPoint, validations } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const router = useRouter()
	const rulePrFormRef = ref<FormInstance>()

	interface RuleForm {
		name: string,
		email: string,
		username: string,
		password: string,
		department: string,
		role: string,
		status: string,
	}

	const rules = reactive<FormRules<RuleForm>>(validations)

	const prFormData = reactive<RuleForm>({
		purpose: '',
	})

	const props = defineProps({
		update: Boolean,
		data: Object
	})

	const labelPosition = ref<FormProps['labelPosition']>('top')
	const emit = defineEmits(['updateButtonIsClicked'])

	const sendPrButtonIsDisabled = ref(true)

	const sendPrForm = async (formType: String, elForm: FormInstance | undefined) => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		if (!elForm) 
			return
		sendPrButtonIsDisabled.value = true
		await elForm.validate((valid, fields) => {
			if (valid) {
				try{
					if (formType === 'submit'){
						axios.post(apiEndPoint + '/api/add_pr', { 
							purpose: prFormData.purpose,
						}).then((res) => {
							ElMessage({
								message: res.data.message,
								type: 'success',
							})
							sendPrButtonIsDisabled.value = false
							router.push({ name: 'request_items', params: { 
								id: res.data.id, 
								department: res.data.department,
								requested_by: res.data.requested_by,
								status: res.data.status,
							} })
						})
					}
					else{
						axios.put(`${apiEndPoint}/api/update_pr/${props.data.id}`, { 
							purpose: prFormData.purpose
						}).then((res) => {
							ElMessage({
								message: res.data.message,
								type: 'success',
							})
							sendPrButtonIsDisabled.value = false
						})
						emit('updateButtonIsClicked')
					}
				}
				catch (err) {
					ElMessage({
						message: `Cannot submit form: ${err.message}`,
						type: 'error',
					})
					sendPrButtonIsDisabled.value = false
				}
			}
			else
				sendPrButtonIsDisabled.value = false
		})
	}

	onMounted(() => {
		if (props.update){
			prFormData.purpose = props.data.purpose
		}
		sendPrButtonIsDisabled.value = false
	})
</script>

<template>
 	<el-form ref="rulePrFormRef" :model="prFormData" :rules="rules" label-width="auto" :label-position="labelPosition">
	    <el-form-item label="Purpose of Request" prop="purpose">
	      	<el-input v-model="prFormData.purpose" :autosize="{minRows: 3}" type="textarea" />
	    </el-form-item>
	    <el-button v-if="props.update" size="large" class="submit-width" type="warning" @click="sendPrForm('update', rulePrFormRef)" :disabled="sendPrButtonIsDisabled"> Update </el-button> 
	    <el-button v-else size="large" class="submit-width" type="success" @click="sendPrForm('submit', rulePrFormRef)" :disabled="sendPrButtonIsDisabled"> Send </el-button> 
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