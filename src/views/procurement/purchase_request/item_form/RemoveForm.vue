<script lang="ts" setup>
	import { ref } from 'vue'
	import { apiEndPoint } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const emit = defineEmits(['removeButtonIsClicked'])

	const props = defineProps({
		data: Object
	})

	const removeItemButtonIsDisabled = ref(false)

	const removeItemForm = async (formType: String) => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			removeItemButtonIsDisabled.value = true
			await axios.delete(`${apiEndPoint}/api/remove_pr_items/${props.data.id}`).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
				})
			emit('removeButtonIsClicked')
		}
		catch (err) {
			ElMessage({
				message: `Cannot remove: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			removeItemButtonIsDisabled.value = false
		}
	}
</script>

<template>
	<el-text> Are you sure you want to remove this item? </el-text>
	<el-form>
	    <el-button size="large" class="remove-width" type="danger" @click="removeItemForm" :disabled="removeItemButtonIsDisabled"> Yes </el-button> 
	</el-form>
</template>

<style scoped>
	.remove-width {
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