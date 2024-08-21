<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import { useAuth } from 'vue-auth3'
	import type { FormProps, FormInstance, FormRules } from 'element-plus'
	import { useRouter } from 'vue-router'
	import { apiEndPoint, validations } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const router = useRouter()
	const auth = useAuth()
	const rulePpmpFormRef = ref<FormInstance>()

	interface RuleForm {
		year: string,
		title: string,
		pmo_end_user_dept: string,
		source_of_funds: string,
	}

	const rules = reactive<FormRules<RuleForm>>(validations)

	const ppmpFormData = reactive<RuleForm>({
		year: new Date().getFullYear(),
		title: '',
		pmo_end_user_dept: '',
		source_of_funds: '',
	})

	const props = defineProps({
		update: Boolean,
		data: Object
	})

	const labelPosition = ref<FormProps['labelPosition']>('top')
	const emit = defineEmits(['updateButtonIsClicked'])

	const sendPpmpButtonIsDisabled = ref(true)

	let userPromise = reactive({})

	const sendPpmpForm = async (formType: String, elForm: FormInstance | undefined) => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		if (!elForm) 
			return
		sendPpmpButtonIsDisabled.value = true
		await elForm.validate((valid, fields) => {
			if (valid) {
				try{
					if (formType === 'submit'){
						axios.post(`${apiEndPoint}/api/add_ppmp`, { 
							year: ppmpFormData.year,
							title: ppmpFormData.title,
							pmo_end_user_dept: ppmpFormData.pmo_end_user_dept,
							source_of_funds: ppmpFormData.source_of_funds,
						}).then((res) => {
							ElMessage({
								message: res.data.message,
								type: 'success',
							})
							sendPpmpButtonIsDisabled.value = false
							router.push({ name: 'manage_ppmp_items', params: { 
								id: res.data.id, 
								year: ppmpFormData.year, 
								title: ppmpFormData.title, 
								pmo_end_user_dept: ppmpFormData.pmo_end_user_dept, 
								source_of_funds: ppmpFormData.source_of_funds 
							} })
						})
						
					}
					else{
						axios.put(`${apiEndPoint}/api/update_ppmp/${props.data.id}`, {
							year: ppmpFormData.year,
							title: ppmpFormData.title,
							pmo_end_user_dept: ppmpFormData.pmo_end_user_dept,
							source_of_funds: ppmpFormData.source_of_funds,
						}).then((res) => {
							ElMessage({
								message: res.data.message,
								type: 'success',
							})
							sendPpmpButtonIsDisabled.value = false
						})
						emit('updateButtonIsClicked')
					}
				}
				catch (err) {
					ElMessage({
						message: `Cannot submit form: ${err.message}`,
						type: 'error',
					})
					sendPpmpButtonIsDisabled.value = false
				}
			}
			else
				sendPpmpButtonIsDisabled.value = false
		})
	}

	const getUserData = async () => {
		try {
			await auth.fetch().then(res => {
				Object.assign(userPromise, res)
				userPromise = userPromise.data[0]
				ppmpFormData.pmo_end_user_dept = userPromise.department
 			})
 			sendPpmpButtonIsDisabled.value = false
		}
		catch (err) {
			ElMessage({
				message: `Retrieving user data failed: ${err.message}`,
				type: 'error',
			})
		}
	}

	onMounted(() => {
		if (props.update){
			sendPpmpButtonIsDisabled.value = false
			ppmpFormData.year = props.data.year
			ppmpFormData.title = props.data.title
			ppmpFormData.pmo_end_user_dept = props.data.pmo_end_user_dept
			ppmpFormData.source_of_funds = props.data.source_of_funds
		}
		else
			getUserData()
	})
</script>

<template>
 	<el-form ref="rulePpmpFormRef" :model="ppmpFormData" :rules="rules" label-width="auto" :label-position="labelPosition">
 		<el-form-item label="Calendar Year" prop="year">
	      	<el-input v-model="ppmpFormData.year" :min="1900" />
		</el-form-item>
	    <el-form-item label="Project Title" prop="title">
	      	<el-input type="textarea" v-model="ppmpFormData.title" />
	    </el-form-item>
	    <el-form-item label="Source of Funds" prop="source_of_funds">
	      	<el-input type="textarea" v-model="ppmpFormData.source_of_funds" />
	    </el-form-item>
	    <el-form-item label="PMO End-User / Department" prop="pmo_end_user_dept">
	      	<el-input type="textarea" v-model="ppmpFormData.pmo_end_user_dept" placeholder="Loading..." readonly />
	    </el-form-item>
	    <el-button v-if="props.update" size="large" class="submit-width" type="warning" @click="sendPpmpForm('update', rulePpmpFormRef)" :disabled="sendPpmpButtonIsDisabled"> Update </el-button> 
	    <el-button v-else  size="large" class="submit-width" type="success" @click="sendPpmpForm('submit', rulePpmpFormRef)" :disabled="sendPpmpButtonIsDisabled"> Send </el-button> 
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