<script lang="ts" setup>
	import { ref } from 'vue'
	import { apiEndPoint } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const emit = defineEmits(['approveButtonIsClicked'])

	const approveItemButtonIsDisabled = ref(false)

	const props = defineProps({
		data: Object
	})

	const approveItemForm = async (formType: String) => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			approveItemButtonIsDisabled.value = true
			await axios.put(`${apiEndPoint}/api/set_approval_pr/${props.data.id}`, {
					status: 'Approved'
				}).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
				})

			emit('approveButtonIsClicked')
		}
		catch (err) {
			ElMessage({
				message: `Cannot approve: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			approveItemButtonIsDisabled.value = false
		}
	}
</script>

<template>
	<el-text> Are you sure you want to approve this request? </el-text>
	<el-form>
	    <el-button size="large" class="approve-width" type="success" @click="approveItemForm" :disabled="approveItemButtonIsDisabled"> Yes </el-button> 
	</el-form>
</template>

<style scoped>
	.approve-width {
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