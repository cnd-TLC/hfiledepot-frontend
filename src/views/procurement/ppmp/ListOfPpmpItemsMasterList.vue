<script lang='ts' setup>
	import { ref, reactive, onMounted, watch } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { ComponentSize, FormProps } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import { downloadPrItemsXlsxTemplate } from '@/constant/functions'
	import { Search, ArrowDown, Refresh, Delete } from '@element-plus/icons-vue'
	import axios from 'axios'
	import MasterListForm from '@/views/procurement/ppmp/ppmp_master_list_form/MasterListForm.vue'
	import RemoveForm from '@/views/procurement/ppmp/ppmp_master_list_form/RemoveForm.vue'
	import BulkUploadForm from '@/components/dropzone/BulkUpload.vue'

	const auth = useAuth()


	const listPpmpItemTableData = ref([])
	const clickedRow = ref([])
	const labelPosition = ref<FormProps['labelPosition']>('top')
	const showBulkUploadForm = ref(false)
	const showMasterListForm = ref(false)
	const showRemoveForm = ref(false)
	const showUpdateItemForm = ref(false)
	const totalRecords = ref(1)
	const pageSize = ref(5)
	const currentPage = ref(1)
	const size = ref<ComponentSize>('default')
	const loading = ref(true)

	let userPromise = reactive({})
	let user = reactive({
		permissions: [],
		department: ''
	})
	let searchValue = ref('')

	const setAuthHeader = () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
	}

	const checkPermission = (val: String) => {
		return user.permissions.includes(val)
	}

	const showForm = (formName: String, data: Array) => {
		clickedRow.value = data
		if (formName === 'MasterListForm')
			showMasterListForm.value = true
		if (formName === 'UpdateForm')
			showUpdateItemForm.value = true
		if (formName === 'RemoveForm')
			showRemoveForm.value = true
		if (formName === 'BulkUploadForm')
			showBulkUploadForm.value = true
	}

	const loadMasterListItemsData = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			await axios.get(`${apiEndPoint}/api/list_of_ppmp_master_list/${pageSize.value}/?page=${currentPage.value}`, {
					params: { search: searchValue.value }
				}).then((res) => {
				listPpmpItemTableData.value = res.data.retrievedData
				totalRecords.value = res.data.total
			})

			showMasterListForm.value = false
			showRemoveForm.value = false
			showUpdateItemForm.value = false
			showBulkUploadForm.value = false
		}
		catch (err) {
			console.log('Error loading data', err)
		}
		finally {
			
		}
	}

	const getUserData = async () => {
		try {
			await auth.fetch().then(res => {
				Object.assign(userPromise, res)
				userPromise = userPromise.data[0]
				user.permissions = JSON.parse(userPromise.permissions)
				user.department = userPromise.department
 			})
		}
		catch (err) {
			console.log('Retrieving user data failed: ', err)
		}
		finally {
			loading.value = false
		}
	}

	const downloadPrItemsTemplate = () => {
		setAuthHeader()
		axios.get(`${apiEndPoint}/api/export_files/pr`, {
		  responseType: 'blob',
		}).then((res) => {
			downloadPrItemsXlsxTemplate(res, 'null')
		})
	}

	const handleSizeChange = (val: number) => {
		searchValue.value = ''
		loadMasterListItemsData()
	}
	const handleCurrentChange = (val: number) => {
		searchValue.value = ''
		loadMasterListItemsData()
	}

	const clearSearch = () => {
		searchValue.value = ''
		loadMasterListItemsData()
	}

	watch(searchValue, (newValue) => {
		if (newValue.trim() === '') {
			loadMasterListItemsData()
		}
    })

	onMounted(() => {
		try {
			loadMasterListItemsData()
			getUserData()
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	})
</script>

<template>
	<el-dialog destroy-on-close :overflow="false" v-model="showRemoveForm" title="Remove Item" width="400">
		<remove-form @removeButtonIsClicked="loadMasterListItemsData(), searchValue = ''" :data="clickedRow"/>
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showBulkUploadForm" title="Bulk Upload" width="600">
		<bulk-upload-form :type="'ppmp_master_list'" :data="clickedRow" @fileUploaded="loadMasterListItemsData(), searchValue = ''" />
	</el-dialog>

	<el-text class="title"> PPMP Items Master List </el-text>
	<el-card shadow="never">
		<el-skeleton animated :loading="loading">
			<template #template>
				<!-- <div class="custom-card" >
					<el-skeleton-item variant="button" style="width: 13%" v-if="user.department != 'Bids and Awards Committee (BAC)'"/>
				</div> -->
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
					<!-- <el-button type="info" @click="downloadPrItemsTemplate" v-if="user.department != 'Bids and Awards Committee (BAC)'"> Download asd Items </el-button> -->
					<el-divider />
					<el-row>
						<el-col :span="16" />
						<el-col :span="8">
							<el-container class="search-area">
						      	<el-input v-model="searchValue" placeholder="Search" clearable @keyup.enter="loadMasterListItemsData">
						      		<template #append>
										<el-button type="success"  @click="loadMasterListItemsData" :icon="Search" />
									</template>
						      	</el-input>
					      	</el-container>
				      	</el-col>
			      	</el-row>
					<el-table :data="listPpmpItemTableData" border>
						<el-table-column prop="year" label="Year" width="150" sortable>
							<template #default="data">
								{{ data.row.year }}
							</template>
						</el-table-column>
						<el-table-column prop="general_desc" label="Item" sortable />
						<el-table-column prop="pmo_end_user_dept" label="Office" sortable />
						<el-table-column label="Unit" width="150">
							<template #default="data">
								<el-text> {{ data.row.unit }}<span v-if="data.row.unit != null">/s</span> </el-text>
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

	.search-area {
		margin-bottom: 20px;
	}
</style>