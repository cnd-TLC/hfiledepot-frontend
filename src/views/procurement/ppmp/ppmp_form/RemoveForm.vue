<script lang="ts" setup>
	import { ref } from 'vue'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'

	const emit = defineEmits(['removeButtonIsClicked'])

	const props = defineProps({
		data: Object
	})

	const removePpmpButtonIsDisabled = ref(false)

	const removePpmpForm = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			await axios.delete(apiEndPoint + '/api/remove_ppmp/' + props.data.id).then((res) => {
					console.log(res.data.message)
				})
			removePpmpButtonIsDisabled.value = true
			emit('removeButtonIsClicked')
		}
		catch (err) {
			console.log('Cannot remove form: ', err)
		}
		finally {
			removePpmpButtonIsDisabled.value = false
		}
	}
</script>

<template>
	<el-text> Are you sure you want to remove this PPMP? </el-text>	
	<el-form>
	    <el-button size="large" class="remove-width" type="danger" @click="removePpmpForm" :disabled="removePpmpButtonIsDisabled"> Yes </el-button> 
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