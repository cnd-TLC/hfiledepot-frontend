<script lang='ts' setup>
	import { ref, reactive, onMounted } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { ComponentSize, FormProps } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'
	import SystemUserForm from '@/views/accounts/system_users/system_users_form/SystemUserForm.vue'
	import RemoveForm from '@/views/accounts/system_users/system_users_form/RemoveForm.vue'

	const auth = useAuth()

	const listOfSystemUsers = ref([])
	const clickedRow = ref([])
	const labelPosition = ref<FormProps['labelPosition']>('top')
	const showSystemUserForm = ref(false)
	const showRemoveForm = ref(false)
	const showUpdateSystemUserForm = ref(false)
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

	const showForm = (formName: String, data: Array) => {
		clickedRow.value = data
		if (formName === 'SysteUserForm')
			showSystemUserForm.value = true
		if (formName === 'UpdateForm')
			showUpdateSystemUserForm.value = true
		if (formName === 'RemoveForm')
			showRemoveForm.value = true
	}

	const loadSystemUsersData = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			await axios.get(apiEndPoint + '/api/list_of_users/' + pageSize.value + '/?page=' + currentPage.value).then((res) => {
				listOfSystemUsers.value = res.data.retrievedData
				totalRecords.value = res.data.total
			})

			showSystemUserForm.value = false
			showRemoveForm.value = false
			showUpdateSystemUserForm.value = false
		}
		catch (err) {
			console.log('Error loading data', err)
		}
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

	const handleSizeChange = (val: number) => {
		loadSystemUsersData()
	}
	const handleCurrentChange = (val: number) => {
		loadSystemUsersData()
	}

	onMounted(() => {
		try {
			loadSystemUsersData()
			getUserData()
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	})
</script>

<template>
	<el-dialog destroy-on-close :overflow="false" v-model="showSystemUserForm" title="System User" width="600">
		<system-user-form @manageButtonIsClicked="loadSystemUsersData" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showUpdateSystemUserForm" title="System User" width="600">
		<system-user-form @manageButtonIsClicked="loadSystemUsersData" :data="clickedRow" :update="true" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showRemoveForm" title="Remove User" width="400">
		<remove-form @removeButtonIsClicked="loadSystemUsersData" :data="clickedRow" />
	</el-dialog>

	<el-text class="title"> System Users </el-text>
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
					<el-button type="success" v-if="checkPermission('systemUsersHasAdd')" @click="showForm('SysteUserForm', null)"> Add User </el-button>
					<el-divider />
					<el-table :data="listOfSystemUsers" stripe border>
						<el-table-column prop="id" label="ID" sortable width="120"/>
						<el-table-column prop="name" label="Name" sortable />
						<el-table-column prop="email" label="Email" sortable />
						<el-table-column prop="department" label="Department" sortable />
						<el-table-column prop="role" label="Role" sortable />
						<el-table-column prop="status" label="Status" width="150">
							<template #default="data">
								<el-text class="status" size="small" v-if="data.row.status == 'Active'" type="success"> {{ data.row.status }} </el-text>
								<el-text class="status" size="small" v-if="data.row.status == 'Inactive'"> {{ data.row.status }} </el-text>
							</template>
						</el-table-column>
						<el-table-column prop="action" v-if="checkPermission('systemUsersHasUpdate') || checkPermission('systemUsersHasRemove')" label="Action" width="170">
							<template #default="data">
								<el-button class="action-button" v-if="checkPermission('systemUsersHasUpdate')" type="info" @click="showForm('UpdateForm', data.row)"> Update </el-button>
								<br v-if="checkPermission('systemUsersHasUpdate')"/>
								<el-button class="action-button" v-if="checkPermission('systemUsersHasRemove')" type="danger" @click="showForm('RemoveForm', data.row)"> Remove </el-button>
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

	.status {
		font-weight: 600;
		text-transform: uppercase;
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