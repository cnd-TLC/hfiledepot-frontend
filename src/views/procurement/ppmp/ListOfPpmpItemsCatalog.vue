<script lang='ts' setup>
	import { ref, reactive, onMounted } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { ComponentSize, FormProps } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'
	import CatalogForm from '@/views/procurement/ppmp/ppmp_catalog_form/CatalogForm.vue'
	import RemoveForm from '@/views/procurement/ppmp/ppmp_catalog_form/RemoveForm.vue'

	const auth = useAuth()

	const listPpmpItemTableData = ref([])
	const clickedRow = ref([])
	const labelPosition = ref<FormProps['labelPosition']>('top')
	const showCatalogForm = ref(false)
	const showRemoveForm = ref(false)
	const showUpdateItemForm = ref(false)
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
		if (formName === 'CatalogForm')
			showCatalogForm.value = true
		if (formName === 'UpdateForm')
			showUpdateItemForm.value = true
		if (formName === 'RemoveForm')
			showRemoveForm.value = true
	}

	const loadCatalogItemsData = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			await axios.get(apiEndPoint + '/api/list_of_ppmp_items_catalog/' + pageSize.value + '/?page=' + currentPage.value).then((res) => {
				listPpmpItemTableData.value = res.data.retrievedData
				totalRecords.value = res.data.total
			})

			showCatalogForm.value = false
			showRemoveForm.value = false
			showUpdateItemForm.value = false
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
		loadCatalogItemsData()
	}
	const handleCurrentChange = (val: number) => {
		loadCatalogItemsData()
	}

	onMounted(() => {
		try {
			loadCatalogItemsData()
			getUserData()
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	})
</script>

<template>
	<el-dialog destroy-on-close :overflow="false" v-model="showCatalogForm" title="Item Form" width="400">
		<catalog-form @manageButtonIsClicked="loadCatalogItemsData" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showUpdateItemForm" title="Item Form" width="400">
		<catalog-form @manageButtonIsClicked="loadCatalogItemsData" :data="clickedRow" :update="true" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showRemoveForm" title="Remove Item" width="400">
		<remove-form @removeButtonIsClicked="loadCatalogItemsData" :data="clickedRow"/>
	</el-dialog>

	<el-text class="title"> PPMP Items Catalog </el-text>
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
					<el-button type="success" v-if="checkPermission('ppmpItemsCatalogHasAdd')" @click="showForm('CatalogForm', null)"> Add Item </el-button>
					<el-divider />
					<el-table :data="listPpmpItemTableData" stripe border>
						<el-table-column prop="year" label="Year" width="150" sortable>
							<template #default="data">
								{{ data.row.year }}
							</template>
						</el-table-column>
						<el-table-column prop="general_desc" label="Item" sortable />
						<el-table-column prop="department" label="Office" sortable />
						<el-table-column label="Unit" width="150">
							<template #default="data">
								<el-text> {{ data.row.unit }}<span v-if="data.row.unit != null">/s</span> </el-text>
							</template>
						</el-table-column>
						<!-- <el-table-column prop="mode_of_procurement" label="Mode" sortable width="150" /> -->
						<el-table-column prop="action" v-if="checkPermission('ppmpItemsCatalogHasUpdate') || checkPermission('ppmpItemsCatalogHasRemove')" label="Action" width="170">
							<template #default="data">
								<el-button class="action-button" v-if="checkPermission('ppmpItemsCatalogHasUpdate')" type="info" @click="showForm('UpdateForm', data.row)"> Update </el-button>
								<br v-if="checkPermission('ppmpItemsCatalogHasUpdate')"/>
								<el-button class="action-button" v-if="checkPermission('ppmpItemsCatalogHasRemove')" type="danger" @click="showForm('RemoveForm', data.row)"> Remove </el-button>
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