<script lang='ts' setup>
	import { ref, reactive, onMounted, watch } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { ComponentSize, FormProps, ElMessage } from 'element-plus'
	import { Search } from '@element-plus/icons-vue'
	import { apiEndPoint } from '@/constant/data'
	import { ArrowDown, Refresh, Delete } from '@element-plus/icons-vue'
	import { downloadBlob } from '@/constant/functions'
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
	let searchValue = ref('')

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
			await axios.get(`${apiEndPoint}/api/list_of_users/${pageSize.value}/?page=${currentPage.value}`, {
				params: { search: searchValue.value }
			}).then((res) => {
				listOfSystemUsers.value = res.data.retrievedData
				totalRecords.value = res.data.total
			})

			showSystemUserForm.value = false
			showRemoveForm.value = false
			showUpdateSystemUserForm.value = false
		}
		catch (err) {
			ElMessage({
				message: `Cannot load sytem users: ${err.message}`,
				type: 'error',
			})
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
			ElMessage({
				message: `Retrieving user data failed: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			loading.value = false
		}
	}

	const handleSizeChange = (val: number) => {
		searchValue.value = ''
		loadSystemUsersData()
	}
	const handleCurrentChange = (val: number) => {
		searchValue.value = ''
		loadSystemUsersData()
	}

	const clearSearch = () => {
		searchValue.value = ''
		loadSystemUsersData()
	}

	// const isEmpty = computed(() => {
	// 	return searchValue.value.trim() === '';
    // });

    watch(searchValue, (newValue) => {
		if (newValue.trim() === '') {
			loadSystemUsersData()
		}
    })

	onMounted(() => {
		try {
			loadSystemUsersData()
			getUserData()
		}
		catch (err) {
			ElMessage({
				message: `Error loading data: ${err.message}`,
				type: 'error',
			})
		}
	})
</script>

<template>
	<el-dialog destroy-on-close :overflow="false" v-model="showSystemUserForm" title="System User" width="400">
		<system-user-form @manageButtonIsClicked="loadSystemUsersData(), searchValue = ''" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showUpdateSystemUserForm" title="System User" width="400">
		<system-user-form @manageButtonIsClicked="loadSystemUsersData(), searchValue = ''" :data="clickedRow" :update="true" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showRemoveForm" title="Remove User" width="400">
		<remove-form @removeButtonIsClicked="loadSystemUsersData(), searchValue = ''" :data="clickedRow" />
	</el-dialog>

	<el-text class="title"> System Users </el-text>
	<el-card shadow="never">
		<el-skeleton animated :loading="loading">
			<template #template>
				<div class="custom-card">
					<el-skeleton-item variant="button" style="width: 7%" />
				</div>
				<el-divider />
				<div class="custom-card">
					<el-skeleton-item variant="text" style="width: 30%" />
				</div>
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
					<el-row>
						<el-col :span="16" />
						<el-col :span="8">
							<el-container class="search-area">
						      	<el-input v-model="searchValue" placeholder="Search" clearable @keyup.enter="loadSystemUsersData">
						      		<template #append>
										<el-button type="success"  @click="loadSystemUsersData" :icon="Search" />
									</template>
						      	</el-input>
					      	</el-container>
				      	</el-col>
			      	</el-row>
					<el-table :data="listOfSystemUsers" border>
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
						<el-table-column prop="action" v-if="checkPermission('systemUsersHasUpdate') || checkPermission('systemUsersHasRemove')" label="Action" width="120">
							<template #default="data">
								<el-dropdown trigger="click">
									<el-button type="info">
										Action &nbsp; <el-icon><arrow-down /></el-icon>
	  								</el-button>
									<template #dropdown>
										<el-dropdown-menu>
											<el-dropdown-item class="action-button" v-if="checkPermission('systemUsersHasUpdate')" @click="showForm('UpdateForm', data.row)"> <el-icon><Refresh /></el-icon> Update </el-dropdown-item>
											<el-dropdown-item class="action-button" v-if="checkPermission('systemUsersHasRemove')" @click="showForm('RemoveForm', data.row)"> <el-text type="danger"> <el-icon><Delete /></el-icon> Remove </el-text> </el-dropdown-item>
										</el-dropdown-menu>
									</template>
								</el-dropdown>
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

	.search-area {
		margin-bottom: 20px;
	}
</style>