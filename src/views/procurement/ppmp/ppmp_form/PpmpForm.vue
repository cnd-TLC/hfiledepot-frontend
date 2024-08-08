<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import { useAuth } from 'vue-auth3'
	import type { FormProps } from 'element-plus'
	import { useRouter } from 'vue-router'
	import { apiEndPoint } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const router = useRouter()
	const auth = useAuth()

	const props = defineProps({
		update: Boolean,
		data: Object
	})

	const labelPosition = ref<FormProps['labelPosition']>('top')
	const emit = defineEmits(['updateButtonIsClicked'])

	const ppmpFormData = reactive({
	  year: new Date().getFullYear(),
	  title: '',
	  pmo_end_user_dept: '',
	  source_of_funds: '',
	})

	const sendPpmpButtonIsDisabled = ref(true)

	let userPromise = reactive({})

	const sendPpmpForm = async (formType: String) => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			sendPpmpButtonIsDisabled.value = true
			if (formType === 'submit'){
				await axios.post(`${apiEndPoint}/api/add_ppmp`, { 
					year: ppmpFormData.year,
					title: ppmpFormData.title,
					pmo_end_user_dept: ppmpFormData.pmo_end_user_dept,
					source_of_funds: ppmpFormData.source_of_funds,
				}).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
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
				await axios.put(`${apiEndPoint}/api/update_ppmp/${props.data.id}`, {
					year: ppmpFormData.year,
					title: ppmpFormData.title,
					pmo_end_user_dept: ppmpFormData.pmo_end_user_dept,
					source_of_funds: ppmpFormData.source_of_funds,
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
			sendPpmpButtonIsDisabled.value = false
		}
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
 	<el-form :model="ppmpFormData" label-width="auto" :label-position="labelPosition">
 		<el-form-item label="Calendar Year">
	      	<el-input v-model="ppmpFormData.year" :min="1900" />
		</el-form-item>
	    <el-form-item label="Project Title">
	      	<el-input type="textarea" v-model="ppmpFormData.title" />
	    </el-form-item>
	    <el-form-item label="Source of Funds">
	      	<el-input type="textarea" v-model="ppmpFormData.source_of_funds" />
	    </el-form-item>
	    <el-form-item label="PMO End-User / Department">
	      	<el-input type="textarea" v-model="ppmpFormData.pmo_end_user_dept" placeholder="Loading..." readonly />
	    </el-form-item>
	    <el-button v-if="props.update" size="large" class="submit-width" type="warning" @click="sendPpmpForm('update')" :disabled="sendPpmpButtonIsDisabled"> Update </el-button> 
	    <el-button v-else  size="large" class="submit-width" type="success" @click="sendPpmpForm('submit')" :disabled="sendPpmpButtonIsDisabled"> Send </el-button> 
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