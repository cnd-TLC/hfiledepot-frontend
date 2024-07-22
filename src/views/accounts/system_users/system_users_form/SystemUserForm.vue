<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import type { FormProps, UploadUserFile } from 'element-plus'
	import { apiEndPoint, listOfDepartments } from '@/constant/data'
	import axios from 'axios'

	const labelPosition = ref<FormProps['labelPosition']>('right')
	const emit = defineEmits(['manageButtonIsClicked'])

	const props = defineProps({
		update: Boolean,
		data: Object
	})


	const systemUserRoleOption = ref([])

	const roleLoading = ref(true)

	const systemUserFormData = reactive({
		name: '',
		email: '',
		username: '',
		password: '',
		department: '',
		role: '',
		status: '',
	})

	const manageSystemUserButtonIsDisabled = ref(false)

	const getRoles = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			await axios.get(apiEndPoint + '/api/list_of_all_roles_and_permissions').then((res) => {
				systemUserRoleOption.value = res.data.retrievedData
			})
		}
		catch (err) {
			console.log('Cannot load roles: ', err)
		}
		finally {
			roleLoading.value = false
		}
	}

	const manageSystemUserForm = async (formType: String) => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			if (formType === 'submit'){
				await axios.post(apiEndPoint + '/api/add_users', { 
					name: systemUserFormData.name,
					email: systemUserFormData.email,
					username: systemUserFormData.username,
					password: systemUserFormData.password,
					department: systemUserFormData.department,
					role: systemUserFormData.role,
					status: systemUserFormData.status,
				}).then((res) => {
					console.log(res.data.message)
				})
			}
			else{
				await axios.put(apiEndPoint + '/api/update_users/' + props.data.id, {
					name: systemUserFormData.name,
					email: systemUserFormData.email,
					username: systemUserFormData.username,
					department: systemUserFormData.department,
					role: systemUserFormData.role,
					status: systemUserFormData.status,
				}).then((res) => {
					console.log(res.data.message)
				})
			}
			manageSystemUserButtonIsDisabled.value = true
			emit('manageButtonIsClicked')
		}
		catch (err) {
			console.log('Cannot submit form: ', err)
		}
		finally {
			manageSystemUserButtonIsDisabled.value = false
		}
	}

	onMounted(() => {
		if (props.update){
			systemUserFormData.name = props.data.name
			systemUserFormData.email = props.data.email
			systemUserFormData.username = props.data.username
			systemUserFormData.department = props.data.department
			systemUserFormData.role = props.data.role
			systemUserFormData.status = props.data.status
		}
		getRoles()
	})
</script>

<template>
 	<el-form :model="systemUserFormData" label-width="auto" :label-position="labelPosition">
 		<el-form-item label="Name">
	      	<el-input v-model="systemUserFormData.name" />
 		</el-form-item>
 		<el-form-item label="Email">
	      	<el-input v-model="systemUserFormData.email" />
 		</el-form-item>
 		<el-form-item label="Username">
	      	<el-input v-model="systemUserFormData.username" />
 		</el-form-item>
 		<el-form-item label="Password" v-if="!props.update">
	      	<el-input v-model="systemUserFormData.password" type="password" show-password />
 		</el-form-item>
	    <el-form-item label="Select Department">
	      	<el-select v-model="systemUserFormData.department" placeholder="Select" filterable>
	      		<el-option v-for="option in listOfDepartments" :key="option.value.id" :label="option.label" :value="option.value" />
	      	</el-select>
	    </el-form-item>
	    <el-form-item label="Select Role">
	      	<el-select v-model="systemUserFormData.role" placeholder="Select" :loading="roleLoading" filterable>
	      		<el-option v-for="option in systemUserRoleOption" :key="option.role" :label="option.role" :value="option.role" />
	      	</el-select>
	    </el-form-item>
	    <el-form-item label="Account Status">
	      	<el-radio-group v-model="systemUserFormData.status">
				<el-radio-button label="Active" value="Active" />
				<el-radio-button label="Inactive" value="Inactive" />
			</el-radio-group>
	    </el-form-item>
	    <el-button v-if="props.update" size="large" class="submit-width" type="warning" @click="manageSystemUserForm('update')" :disabled="manageSystemUserButtonIsDisabled"> Update </el-button> 
	    <el-button v-else size="large" class="submit-width" type="success" @click="manageSystemUserForm('submit')" :disabled="manageSystemUserButtonIsDisabled"> Add </el-button> 
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