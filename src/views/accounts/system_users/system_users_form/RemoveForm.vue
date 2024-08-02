<script lang="ts" setup>
	import { ref } from 'vue'
	import { apiEndPoint } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const emit = defineEmits(['removeButtonIsClicked'])

	const props = defineProps({
		data: Object
	})

	const removeUserButtonIsDisabled = ref(false)

	const removeUser = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			removeUserButtonIsDisabled.value = true
			await axios.delete(`${apiEndPoint}/api/remove_users/${props.data.id}`).then((res) => {
					emit('removeButtonIsClicked')
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
				})
		}
		catch (err) {
			ElMessage({
				message: `Cannot remove user: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			removeUserButtonIsDisabled.value = false
		}
	}
</script>

<template>
	<el-text> Are you sure you want to remove this user? </el-text>
	<el-form>
	    <el-button size="large" class="remove-width" type="danger" @click="removeUser" :disabled="removeUserButtonIsDisabled"> Yes </el-button> 
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