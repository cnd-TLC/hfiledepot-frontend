<script lang='ts' setup>
	import { ref, onMounted } from 'vue'
	import { ComponentSize, FormProps, TableColumnCtx } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import { formatNumber } from '@/constant/functions'
	import { useRouter } from 'vue-router'
	import { ArrowDown, Refresh, Delete } from '@element-plus/icons-vue'
	import { downloadBlob, downloadPpmpItemsTemplate } from '@/constant/functions'
	import axios from 'axios'
	import ItemForm from '@/views/procurement/ppmp/ppmp_item_form/ItemForm.vue'
	import RemoveForm from '@/views/procurement/ppmp/ppmp_item_form/RemoveForm.vue'
	import BulkUploadForm from '@/components/dropzone/BulkUpload.vue'

	const router = useRouter().currentRoute.value

	const totalEstimatedBudget = ref(0)
	const listPpmpItemTableData  = ref([])
	const clickedRow = ref([])
	const labelPosition = ref<FormProps['labelPosition']>('top')
	const showBulkUploadForm = ref(false)
	const showItemForm = ref(false)
	const showRemoveForm = ref(false)
	const showUpdateItemForm = ref(false)
	const totalRecords = ref(1)
	const pageSize = ref(5)
	const currentPage = ref(1)
	const size = ref<ComponentSize>('default')
	const loading = ref(true)

	const setAuthHeader = () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
	}

	const showForm = (formName: string, data: Array) => {
		clickedRow.value = data
		if (formName === 'ItemForm')
			showItemForm.value = true
		if (formName === 'UpdateForm')
			showUpdateItemForm.value = true
		if (formName === 'RemoveForm')
			showRemoveForm.value = true
		if (formName === 'BulkUploadForm')
			showBulkUploadForm.value = true
	}

	const loadPpmpItemData = async () => {
		setAuthHeader()
		try {
			await axios.get(`${apiEndPoint}/api/list_of_ppmp_items/${router.params.id}/${pageSize.value}/?page=${currentPage.value}`).then((res) => {
				listPpmpItemTableData.value = res.data.retrievedData
				const calculateEstBudget = listPpmpItemTableData.value.reduce((acc, current) => {
				  return acc + parseFloat(current.estimated_budget);
				}, 0);
				totalEstimatedBudget.value = calculateEstBudget.toFixed(2)
				totalRecords.value = res.data.total
			})

			showItemForm.value = false
			showRemoveForm.value = false
			showUpdateItemForm.value = false
			showBulkUploadForm.value = false
		}
		catch (err) {
			console.log('Error loading data', err)
		}
		finally {
			loading.value = false
		}
	}

	const handleSizeChange = (val: number) => {
		loadPpmpItemData()
	}
	const handleCurrentChange = (val: number) => {
		loadPpmpItemData()
	}

	onMounted(() => {
		try {
			loadPpmpItemData()
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	})
</script>

<template>
	<el-dialog destroy-on-close :overflow="false" v-model="showItemForm" title="Item Form" width="95%">
		<item-form @manageButtonIsClicked="loadPpmpItemData" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showUpdateItemForm" title="Item Form" width="95%">
		<item-form @manageButtonIsClicked="loadPpmpItemData" :data="clickedRow" :update="true" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showRemoveForm" title="Remove Item" width="400">
		<remove-form @removeButtonIsClicked="loadPpmpItemData" :data="clickedRow" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showBulkUploadForm" title="Bulk Upload" width="600">
		<bulk-upload-form :type="'ppmp'" :data="clickedRow" @fileUploaded="loadPpmpItemData" />
	</el-dialog>

	<el-text class="title"> PPMP Request Items List </el-text>
	<!-- <el-card shadow="never">
		<el-skeleton animated :loading="loading">
			<template #template>
				<el-skeleton-item variant="text" style="width: 12%" />
				<br/>
				<el-skeleton-item variant="text" style="width: 8%" />
				<br/>
				<el-skeleton-item variant="text" style="width: 20%" />
				<br/>
				<el-skeleton-item variant="text" style="width: 15%" />
				<br/>
				<el-skeleton-item variant="text" style="width: 13%" />
			</template>
			<template #default>
				<el-text class="card-title"> Calendar Year : <el-text class="card-title-content"> {{ router.params.year }} </el-text> </el-text>
				<br/>
				<el-text class="card-title"> Project Title : <el-text class="card-title-content"> {{ router.params.title }} </el-text> </el-text>
				<br/>
				<el-text class="card-title"> PMO End-User / Department : <el-text class="card-title-content"> {{ router.params.pmo_end_user_dept }} </el-text> </el-text>
				<br/>
				<el-text class="card-title"> Source of Funds : <el-text class="card-title-content"> {{ router.params.source_of_funds }} </el-text> </el-text>
				<br/>
				<el-text> Received By : </el-text>
				<br/> comment dito
			</template>
		</el-skeleton>
	</el-card> -->
	<el-card shadow="never">
		<el-skeleton animated :loading="loading">
			<template #template>
				<div class="custom-card">
					<el-skeleton-item variant="button" style="width: 13%" />
					&nbsp;
					<el-skeleton-item variant="button" style="width: 13%" />
					&nbsp;
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
					<el-button type="info" @click="downloadPpmpItemsTemplate(router.params.id)"> Download Template </el-button>
					<el-button type="success" @click="showForm('BulkUploadForm', router.params)"> Bulk Upload Items </el-button>
					<el-button type="success" @click="showForm('ItemForm', null)"> Add Item </el-button>
					<el-divider />
					<div class="table-border">
						<el-table :data="listPpmpItemTableData">
							<el-table-column type="expand">
								<template #default="data">
									<el-form class="custom-form" label-width="auto" :label-position="labelPosition">
								    	<el-divider>
											<el-text class="schedule-title">
								    			Schedule / Milestone of Activities
								    		</el-text> 
										</el-divider>
										<el-form-item class="quarter-padding">
									    	<el-col :span="12" class="input-area">
									    		<el-form-item>
									    			<template #label>
									    				<el-text class="quarter-title" type="danger">
									    					1st Quarter
									    				</el-text>
									    			</template>
									    			<el-col :span="8" class="input-area">
									    				<el-form-item label="January">
													      	<el-input :value="data.row.jan" readonly />
														</el-form-item>
									    			</el-col>
									    			<el-col :span="8" class="input-area">
									    				<el-form-item label="February">
													      	<el-input :value="data.row.feb" readonly />
														</el-form-item>
									    			</el-col>
									    			<el-col :span="8">
									    				<el-form-item label="March">
													      	<el-input :value="data.row.mar" readonly />
														</el-form-item>
									    			</el-col>
									    		</el-form-item>
									    	</el-col>
								    		<el-col :span="12">
									    		<el-form-item>
									    			<template #label>
									    				<el-text class="quarter-title" type="danger">
									    					2nd Quarter
									    				</el-text>
									    			</template>
									    			<el-col :span="8" class="input-area">
									    				<el-form-item label="April">
													      	<el-input :value="data.row.apr" readonly />
														</el-form-item>
									    			</el-col>
									    			<el-col :span="8" class="input-area">
									    				<el-form-item label="May">
													      	<el-input :value="data.row.may" readonly />
														</el-form-item>
									    			</el-col>
									    			<el-col :span="8">
									    				<el-form-item label="June">
													      	<el-input :value="data.row.jun" readonly />
														</el-form-item>
									    			</el-col>
									    		</el-form-item>
									    	</el-col>
								    		<el-col :span="12" class="input-area">
									    		<el-form-item>
									    			<template #label>
									    				<el-text class="quarter-title" type="danger">
									    					3rd Quarter
									    				</el-text>
									    			</template>
									    			<el-col :span="8" class="input-area">
									    				<el-form-item label="July">
													      	<el-input :value="data.row.jul"readonly />
														</el-form-item>
									    			</el-col>
									    			<el-col :span="8" class="input-area">
									    				<el-form-item label="August">
													      	<el-input :value="data.row.aug"readonly />
														</el-form-item>
									    			</el-col>
									    			<el-col :span="8">
									    				<el-form-item label="September">
													      	<el-input :value="data.row.sept"readonly />
														</el-form-item>
									    			</el-col>
									    		</el-form-item>
									    	</el-col>
								    		<el-col :span="12">
									    		<el-form-item>
									    			<template #label>
									    				<el-text class="quarter-title" type="danger">
									    					4th Quarter
									    				</el-text>
									    			</template>
									    			<el-col :span="8" class="input-area">
									    				<el-form-item label="October">
													      	<el-input :value="data.row.oct" readonly />
														</el-form-item>
									    			</el-col>
									    			<el-col :span="8" class="input-area">
									    				<el-form-item label="November">
													      	<el-input :value="data.row.nov"readonly />
														</el-form-item>
									    			</el-col>
									    			<el-col :span="8">
									    				<el-form-item label="December">
													      	<el-input :value="data.row.dec"readonly />
														</el-form-item>
									    			</el-col>
									    		</el-form-item>
									    	</el-col>
									    </el-form-item>
									</el-form>
								</template>
							</el-table-column>
							<el-table-column prop="code" label="Code" sortable width="150"/>
							<el-table-column prop="general_desc" label="Requested Item" sortable>
								<template #default="data">
									<el-text> {{ data.row.general_desc }} </el-text>
									<br />
									<el-text class="category" type="warning"> <i> {{ data.row.category.split(' - ')[1] }} </i> </el-text>
								</template>
							</el-table-column>
							<el-table-column label="Quantity" width="120">
								<template #default="data">
									<el-text v-if="!data.row.lumpsum"> {{ data.row.quantity }} {{ data.row.unit }}<span v-if="data.row.unit != null">/s</span> </el-text>
									<el-text class="lumpsum" v-else>
										Lumpsum
									</el-text>
								</template>
							</el-table-column>
							<el-table-column prop="mode_of_procurement" label="Mode" sortable width="100" />
							<el-table-column label="Est. Budget" prop="estimated_budget" width="150">
								<template #default="data">
									<el-text> ₱ {{ formatNumber(data.row.estimated_budget) }} </el-text>
				 				</template>
							</el-table-column>
							<el-table-column prop="action" label="Action" width="120">
								<template #default="data">
									<el-dropdown trigger="click">
										<el-button type="info">
											Action &nbsp; <el-icon><arrow-down /></el-icon>
		  								</el-button>
										<template #dropdown>
											<el-dropdown-menu>
												<el-dropdown-item type="info" @click="showForm('UpdateForm', data.row)"> <el-icon><Refresh /></el-icon> Update </el-dropdown-item>
												<el-dropdown-item type="danger" @click="showForm('RemoveForm', data.row)"> <el-text type="danger"> <el-icon><Delete /></el-icon> Remove </el-text> </el-dropdown-item>
											</el-dropdown-menu>
										</template>
									</el-dropdown>
								</template>
							</el-table-column>
						</el-table>
						<div class="total-card">
							<el-text class="total"> Total : </el-text>
							<el-text class="total number"> ₱ {{ formatNumber(totalEstimatedBudget) }} </el-text>
						</div>
					</div>
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
	.table-border {
		margin-top: 20px;
		border: 1px solid var(--el-border-color-light);
	}
	
	.title {
		font-size: 20px;
		font-weight: 400;
	}

	.lumpsum {
		font-style: italic;
		font-weight: 400;
		font-size: 12px;
	}

	.custom-card {
		text-align: right;
	}

	.custom-form {
		padding: 10px;
	}

	.quarter-padding {
		margin: 0 10px;
	}

	.schedule-title {
		font-size: 16px;
		font-weight: 500;
	}

	.quarter-title {
		font-size: 14px;
		font-weight: 500;
	}

	.card-title {
		font-size: 16px;
		font-weight: 500;
	}

	.card-title-content {
		font-size: 16px;
	}

	.category {
		font-size: 10px;
		line-height: -10;
	}

	.total-card {
		margin: 20px 20px !important;
	}

	.total {
		font-size: 20px;
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