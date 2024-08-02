<script lang='ts' setup>
	import { ref, reactive, onMounted } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { ComponentSize, FormProps } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'
	import RoleAndPermissionForm from '@/views/accounts/roles_and_permissions/roles_and_permissions_form/RoleAndPermissionForm.vue'
	import RemoveForm from '@/views/accounts/roles_and_permissions/roles_and_permissions_form/RemoveForm.vue'

	const auth = useAuth()

	const listOfRolesAndPermissions = ref([])
	const clickedRow = ref([])
	const labelPosition = ref<FormProps['labelPosition']>('top')
	const showRoleAndPermissionForm = ref(false)
	const showRemoveForm = ref(false)
	const showUpdateRoleForm = ref(false)
	const totalRecords = ref(1)
	const pageSize = ref(5)
	const currentPage = ref(1)
	const size = ref<ComponentSize>('default')
	const loading = ref(true)

	let userPromise = reactive({})
	let user = reactive({
		permissions: []
	})

	const checkPermission = (val: String) => {
		return user.permissions.includes(val)
	}

	const getUserData = async () => {
		try {
			await auth.fetch().then(res => {
				Object.assign(userPromise, res)
				userPromise = userPromise.data[0]
				user.permissions = JSON.parse(userPromise.permissions)
 			})
		}
		catch (err) {
			console.log('Retrieving user data failed: ', err)
		}
		finally {
			loading.value = false
		}
	}

	const showForm = (formName: String, data: Array) => {
		clickedRow.value = data
		if (formName === 'RoleAndPermissionForm')
			showRoleAndPermissionForm.value = true
		if (formName === 'UpdateForm')
			showUpdateRoleForm.value = true
		if (formName === 'RemoveForm')
			showRemoveForm.value = true
	}

	const loadRolesAndPermissionsData = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			await axios.get(`${apiEndPoint}/api/list_of_roles_and_permissions/${pageSize.value}/?page=${currentPage.value}`, { 
				headers: { 
					'Content-Type': 'multipart/form-data',
				} 
			}).then((res) => {
				listOfRolesAndPermissions.value = res.data.retrievedData
				totalRecords.value = res.data.total
			})

			showRoleAndPermissionForm.value = false
			showRemoveForm.value = false
			showUpdateRoleForm.value = false
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	}

	const handleSizeChange = (val: number) => {
		loadRolesAndPermissionsData()
	}
	const handleCurrentChange = (val: number) => {
		loadRolesAndPermissionsData()
	}

	onMounted(() => {
		try {
			loadRolesAndPermissionsData()
			getUserData()
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	})
</script>

<template>
	<el-dialog destroy-on-close :overflow="false" v-model="showRoleAndPermissionForm" title="Role and Permissions" width="95%">
		<role-and-permission-form @manageButtonIsClicked="loadRolesAndPermissionsData" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showUpdateRoleForm" title="Role and Permissions" width="95%">
		<role-and-permission-form @manageButtonIsClicked="loadRolesAndPermissionsData" :data="clickedRow" :update="true" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showRemoveForm" title="Remove Role" width="400">
		<remove-form @removeButtonIsClicked="loadRolesAndPermissionsData" :data="clickedRow" />
	</el-dialog>

	<el-text class="title"> Roles and Permissions </el-text>
	<el-card shadow="never">
		<el-skeleton animated :loading="loading">
			<template #template>
				<div class="custom-card">
					<el-skeleton-item variant="button" style="width: 7%" />
				</div>
				<el-divider />
				<el-skeleton-item v-for="n in 10" variant="text" style="width: 100%" />
				<el-divider />
				<div class="custom-card">
					<el-skeleton-item variant="rect" style="width: 40%" />
				</div>
			</template>
			<template #default>
				<div class="custom-card">
					<el-button type="success" v-if="checkPermission('rolesAndPermissionsHasAdd')" @click="showForm('RoleAndPermissionForm', null)"> Add Role </el-button>
					<el-divider />
					<el-table :data="listOfRolesAndPermissions" stripe border>
						<el-table-column prop="role" label="Role Name" sortable width="170" />
						<el-table-column prop="description" label="Description" />
						<el-table-column prop="action" v-if="checkPermission('rolesAndPermissionsHasUpdate') || checkPermission('rolesAndPermissionsHasDelete')" label="Action" width="170">
							<template #default="data">
								<el-button class="action-button" v-if="checkPermission('rolesAndPermissionsHasUpdate') && data.row.role != 'Admin'" type="info" @click="showForm('UpdateForm', data.row)"> Update </el-button>
								<br v-if="checkPermission('rolesAndPermissionsHasUpdate') && data.row.role != 'Admin'"/>
								<el-button class="action-button" v-if="checkPermission('rolesAndPermissionsHasRemove') && data.row.role != 'Admin'" type="danger" @click="showForm('RemoveForm', data.row)"> Remove </el-button>
								<el-text v-if="data.row.role == 'Admin'" type="info"> <i> Cannot take action for this role </i> </el-text>
							</template>
						</el-table-column>
					</el-table>
					<el-divider />
					<el-pagination
						v-model:current-page="currentPage"
						v-model:page-size="pageSize"
						:page-sizes="[5, 10, 50, 100]"
						:size="size"
						layout="total, sizes, prev, pager, next, jumper"
						:total="totalRecords"
						@size-change="handleSizeChange"
						@current-change="handleCurrentChange"
					/>
				</div>
			</template>
		</el-skeleton>
	</el-card>
</template>

<style scoped>
	.title {
		font-size: 20px;
		font-weight: 400;
	}

	.action-button {
		width: 100%;
		margin-bottom: 3px;
	}

	.custom-card {
		text-align: right;
	}

	.schedule-title {
		font-size: 16px;
		font-weight: 500;
	}

	.quarter-title {
		font-size: 14px;
		font-weight: 500;
	}

	.input-area {
		padding: 0 10px 0 0;
	}

	.el-card {
		margin-top: 15px;
	}

	.el-pagination {
		justify-content: right;
	}
</style>