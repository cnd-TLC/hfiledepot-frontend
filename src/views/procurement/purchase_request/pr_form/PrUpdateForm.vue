<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import type { FormProps } from 'element-plus'
	import { useRouter } from 'vue-router'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'

	const router = useRouter()

	const props = defineProps({
		data: Object
	})


	const currentStep = ref(0)
	const pr_id = ref(0)

	const labelPosition = ref<FormProps['labelPosition']>('top')

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
		currentStep.value++
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			sendPrButtonIsDisabled.value = true
			await axios.post(apiEndPoint + '/api/add_pr', { 
				// pr_no: prFormData.pr_no, 
				// section: prFormData.section, 
				// fpp: prFormData.fpp, 
				// fund: prFormData.fund, 
				purpose: prFormData.purpose,
			}).then((res) => {
				console.log(res.data.message)
				pr_id.value = res.data.id
				loadPrItemData()
				// router.push({ name: 'request_items', params: { 
				// 	id: res.data.id, 
				// } })
			})
		}
		catch (err) {
			console.log('Cannot submit form: ', err)
		}
		finally {
			sendPrButtonIsDisabled.value = false
		}
	}

	onMounted(() => {
		sendPrButtonIsDisabled.value = false
	})
</script>

<template>
	<el-steps style="max-width: 600px; background-color: #fff !important;" :active="currentStep" finish-status="success" align-center>
		<el-step title="Step 1" description="PR Form" />
		<el-step title="Step 2" description="Attachments" />
		<el-step title="Step 3" description="Finish" />
	</el-steps>

	<div v-if="currentStep === 0">
	 	<el-form :model="prFormData" label-width="auto" :label-position="labelPosition">
		    <el-form-item label="Purpose of Request">
		      	<el-input v-model="prFormData.purpose" :autosize="{minRows: 3}" type="textarea" />
		    </el-form-item>
		    <el-button size="large" class="submit-width" type="success" @click="sendPrForm('submit')" :disabled="sendPrButtonIsDisabled"> Send </el-button> 
	  	</el-form>
	</div>
	<div v-if="currentStep === 1">
		Hello
	</div>
	<div v-if="currentStep === 2">
		Hello
	</div>
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

	.el-steps {
		margin-bottom: 15px;
	}
</style>