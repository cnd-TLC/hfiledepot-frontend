<script lang="ts" setup>
	import { ref } from 'vue'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'

	const emit = defineEmits(['manageStatusButtonIsClicked'])

	const props = defineProps({
		data: Object
	})

	const approveItemButtonIsDisabled = ref(false)

	const approveItemForm = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			await axios.put(apiEndPoint + '/api/set_approval_ppmp/' + props.data.id, {
					status: 'Approved'
				}).then((res) => {
					console.log(res.data.message)
				})

			approveItemButtonIsDisabled.value = true
			emit('manageStatusButtonIsClicked')
		}
		catch (err) {
			console.log('Cannot approve form: ', err)
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