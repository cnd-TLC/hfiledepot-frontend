<script lang="ts" setup>
	import { ref } from 'vue'
	import { apiEndPoint } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const logoutAllButtonIsDisabled = ref(false)

	const logoutAll = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			logoutAllButtonIsDisabled.value = true
			await axios.post(`${apiEndPoint}/api/logout_all`).then((res) => {
					// ElMessage({
					// 	message: res.data.message,
					// 	type: 'success',
					// })
					localStorage.removeItem('auth_stay_signed_in')
					localStorage.removeItem('auth_token_default')
					document.cookie = 'auth_stay_signed_in=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
					document.cookie = 'auth_token_default=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'

					window.location.reload()
				})
		}
		catch (err) {
			ElMessage({
				message: `Cannot logout: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			logoutAllButtonIsDisabled.value = false
		}
	}
</script>

<template>
	<el-text> Are you sure you want to logout all sessions? </el-text>
	<br />
	<el-text type="danger"> <i> This will logout your current session </i> </el-text>
	<el-form>
	    <el-button size="large" class="remove-width" type="danger" @click="logoutAll" :disabled="logoutAllButtonIsDisabled"> Yes </el-button> 
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