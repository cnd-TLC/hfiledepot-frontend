<script lang="ts" setup>
	import { ref, reactive } from 'vue'
	import type { FormProps } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const labelPosition = ref<FormProps['labelPosition']>('top')

	const emit = defineEmits(['manageStatusButtonIsClicked'])

	const props = defineProps({
		data: Object
	})

	const pendingItemButtonIsDisabled = ref(false)

	const ppmpFormData = reactive({
		reason: '',
	})

	const pendingItemForm = async (formType: String) => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			pendingItemButtonIsDisabled.value = true
			await axios.put(`${apiEndPoint}/api/set_approval_ppmp/${props.data.id}`, {
					status: 'Pending',
					reason: ppmpFormData.reason
				}).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
				})

			emit('manageStatusButtonIsClicked')
		}
		catch (err) {
			ElMessage({
				message: `Cannot pending: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			pendingItemButtonIsDisabled.value = false
		}
	}
</script>

<template>
	<el-text> Are you sure you want to set this request to pending? </el-text>
	<el-form :label-position="labelPosition">
		<el-form-item>
			<template #label>
				<el-text> Reason <i> (optional) </i></el-text>
			</template>
	      	<el-input v-model="ppmpFormData.reason" :autosize="{minRows: 5}" type="textarea" />
	    </el-form-item>
	    <el-button size="large" class="pending-width" type="success" @click="pendingItemForm" :disabled="pendingItemButtonIsDisabled"> Yes </el-button> 
	</el-form>
</template>

<style scoped>
	.pending-width {
		display: block;
		float: right;
		width: 30%;
	}

	.el-form {
		margin-top: 15px;
	}

	.full-width {
		display: block;
		width: 100%;
	}

	.el-form {
		padding-bottom: 40px;
	}
</style>