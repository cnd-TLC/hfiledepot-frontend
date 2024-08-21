<script lang='ts' setup>
	import { reactive, ref, onMounted } from 'vue'
	import type { FormProps, FormInstance, FormRules } from 'element-plus'
	import { ElMessage } from 'element-plus'
	import { apiEndPoint, listOfDepartments, validations } from '@/constant/data'
	import axios from 'axios'

	const labelPosition = ref<FormProps['labelPosition']>('top')
	const emit = defineEmits(['manageButtonIsClicked'])
	const ruleUserFormRef = ref<FormInstance>()

	interface RuleForm {
		name: string,
		email: string,
		username: string,
		password: string,
		department: string,
		role: string,
		status: string,
	}

	const rules = reactive<FormRules<RuleForm>>(validations)

	const systemUserFormData = reactive<RuleForm>({
		name: '',
		email: '',
		username: '',
		password: '',
		department: '',
		role: '',
		status: '',
	})

	const props = defineProps({
		update: Boolean,
		data: Object
	})


	const systemUserRoleOption = ref([])

	const roleLoading = ref(true)
	const manageSystemUserButtonIsDisabled = ref(false)

	const setAuthHeader = () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
	}

	const getRoles = async () => {
		setAuthHeader()
		try{
			await axios.get(`${apiEndPoint}/api/list_of_all_roles_and_permissions`).then((res) => {
				systemUserRoleOption.value = res.data.retrievedData
			})
		}
		catch (err) {
			ElMessage({
				message: `Cannot load roles: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			roleLoading.value = false
		}
	}

	const manageSystemUserForm = async (formType: String, elForm: FormInstance | undefined) => {
		setAuthHeader()
		if (!elForm) 
			return
		manageSystemUserButtonIsDisabled.value = true
		await elForm.validate((valid, fields) => {
			if (valid) {
				try{
					if (formType === 'submit'){
						axios.post(`${apiEndPoint}/api/add_users`, { 
							name: systemUserFormData.name,
							email: systemUserFormData.email,
							username: systemUserFormData.username,
							password: systemUserFormData.password,
							department: systemUserFormData.department,
							role: systemUserFormData.role,
							status: systemUserFormData.status,
						}).then((res) => {
					  		ElMessage({
								message: res.data.message,
								type: 'success',
							})
							manageSystemUserButtonIsDisabled.value = false
						})
					}
					else{
						axios.put(`${apiEndPoint}/api/update_users/${props.data.id}`, {
							name: systemUserFormData.name,
							email: systemUserFormData.email,
							username: systemUserFormData.username,
							department: systemUserFormData.department,
							role: systemUserFormData.role,
							status: systemUserFormData.status,
						}).then((res) => {
							ElMessage({
								message: res.data.message,
								type: 'success',
							})
							manageSystemUserButtonIsDisabled.value = false
						})
					}
					emit('manageButtonIsClicked')
				}
				catch (err) {
					ElMessage({
						message: `Cannot submit form: ${err.message}`,
						type: 'error',
					})
					manageSystemUserButtonIsDisabled.value = false
				}
			}
			else
				manageSystemUserButtonIsDisabled.value = false

		})
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
 	<el-form ref="ruleUserFormRef" :model="systemUserFormData" :rules="rules" label-width="auto" :label-position="labelPosition">
 		<el-form-item label="Name" prop="name">
	      	<el-input v-model="systemUserFormData.name" />
 		</el-form-item>
 		<el-form-item label="Email" prop="email">
	      	<el-input v-model="systemUserFormData.email" />
 		</el-form-item>
 		<el-form-item label="Username" prop="username">
	      	<el-input v-model="systemUserFormData.username" />
 		</el-form-item>
 		<el-form-item label="Password" prop="password" v-if="!props.update">
	      	<el-input v-model="systemUserFormData.password" type="password" show-password />
 		</el-form-item>
	    <el-form-item label="Department" prop="department">
	      	<el-select v-model="systemUserFormData.department" placeholder="Select" filterable>
	      		<el-option v-for="option in listOfDepartments" :key="option.value.id" :label="option.label" :value="option.value" />
	      	</el-select>
	    </el-form-item>
	    <el-form-item label="Role" prop="role">
	      	<el-select v-model="systemUserFormData.role" placeholder="Select" :loading="roleLoading" filterable>
	      		<el-option v-for="option in systemUserRoleOption" :key="option.role" :label="option.role" :value="option.role" />
	      	</el-select>
	    </el-form-item>
	    <el-form-item label="Account Status" prop="status">
	      	<el-radio-group v-model="systemUserFormData.status" fill="#67c23a">
				<el-radio-button label="Active" value="Active" />
				<el-radio-button label="Inactive" value="Inactive" />
			</el-radio-group>
	    </el-form-item>
	    <el-button v-if="props.update" size="large" class="submit-width" type="warning" @click="manageSystemUserForm('update', ruleUserFormRef)" :disabled="manageSystemUserButtonIsDisabled"> Update </el-button> 
	    <el-button v-else size="large" class="submit-width" type="success" @click="manageSystemUserForm('submit', ruleUserFormRef)" :disabled="manageSystemUserButtonIsDisabled"> Add </el-button> 
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