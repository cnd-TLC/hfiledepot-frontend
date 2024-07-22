<script lang='ts' setup>
	import { ref, reactive, onMounted } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { ComponentSize } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'
	import PrForm from '@/views/procurement/purchase_request/pr_form/PrForm.vue'
	import PreviewForm from '@/views/procurement/purchase_request/pr_form/PreviewForm.vue'
	import AttachmentForm from '@/components/dropzone/Dropzone.vue'
	import RemoveForm from '@/views/procurement/purchase_request/pr_form/RemoveForm.vue'
	import { useRouter } from 'vue-router'

	const router = useRouter()
	const auth = useAuth()

	const listPrTableData = ref([])
	const clickedRow = ref([])
	const showPrForm = ref(false)
	const showPreviewForm = ref(false)
	const showAttachmentsForm = ref(false)
	const showUpdateForm = ref(false)
	const showRemoveForm = ref(false)
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
		if (formName === 'PrForm')
			showPrForm.value = true
		if (formName === 'PreviewForm')
			showPreviewForm.value = true
		if (formName === 'AttachmentsForm')
			showAttachmentsForm.value = true
		if (formName === 'UpdateForm')
			showUpdateForm.value = true
		if (formName === 'RemoveForm')
			showRemoveForm.value = true
	}

	const loadPrData = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			await axios.get(apiEndPoint + '/api/list_of_user_pr/' + pageSize.value + '/?page=' + currentPage.value).then((res) => {
				listPrTableData.value = res.data.retrievedData
				totalRecords.value = res.data.total
			})

			showPrForm.value = false
			showPreviewForm.value = false
			// showAttachmentsForm.value = false
			showUpdateForm.value = false
			showRemoveForm.value = false
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
		loadPrData()
	}
	const handleCurrentChange = (val: number) => {
		loadPrData()
	}

	const requestItem = (data: Array) => {
		clickedRow.value = data
		try{
			router.push({ name: 'request_items', params: { 
				id: clickedRow.value.id
			} })
		}
		catch (err) {
			console.log('Cannot proceed to request item: ', err)
		}
		finally {

		}
	}

	onMounted(() => {
		try {
			loadPrData()
			getUserData()
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	})
</script>

<template>
	<el-dialog destroy-on-close :overflow="false" v-model="showPreviewForm" title="PR Details" width="95%">
		<preview-form :data="clickedRow" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showAttachmentsForm" title="PR Attachments" width="600">
		<attachment-form :type="'pr'" :data="clickedRow" @attachmentUpdated="loadPrData" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showPrForm" title="PR Form" width="400">
		<pr-form />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showUpdateForm" title="PR Form" width="400">
		<pr-form :update="true" @updateButtonIsClicked="loadPrData" :data="clickedRow" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showRemoveForm" title="Remove Purchase Request" width="400">
		<remove-form @removeButtonIsClicked="loadPrData" :data="clickedRow" />
	</el-dialog>

	<el-text class="title"> Purchase Requests </el-text>

	<el-card shadow="never">
		<el-skeleton animated :loading="loading">
			<template #template>
				<div class="custom-card">
					<el-skeleton-item variant="button" style="width: 17%" />
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
					<el-button type="success" v-if="checkPermission('purchaseRequestHasSend')" @click="showForm('PrForm', null)"> Send Purchase Request </el-button>
					<el-divider />
					<el-table :data="listPrTableData" stripe border>
						<el-table-column prop="pr_no" label="PR Number" sortable>
							<template #default="data">
								<div>
									<el-text size="large"> {{ data.row.pr_no }} </el-text>
									<br />
									<el-text size="small"> {{ data.row.created_at }} </el-text>
								</div>
							</template>
						</el-table-column>
						<el-table-column width="190px" prop="dep_sec" label="Requested By" sortable>
							<template #default="data">
								<el-text> {{ data.row.requested_by }} </el-text>
								<br />
								<el-text size="large"> {{ data.row.department }} </el-text>
								<br />
								<el-text size="small"> {{ data.row.section }} </el-text>
							</template>
						</el-table-column>
						<!-- <el-table-column prop="cash_availability" label="Cash Availability" /> -->
						<el-table-column prop="fpp" label="FPP" />
						<el-table-column prop="fund" label="Fund" sortable>
							<template #default="data">
								<!-- ₱  -->
								<el-text size="large"> {{ data.row.fund }} </el-text>
							</template>
						</el-table-column>

						<el-table-column prop="status" label="Status">
							<template #default="data">
								<el-text class="status" size="small" v-if="data.row.status == 'Pending'" type="warning"> {{ data.row.status }} </el-text>
								<el-text class="status" size="small" v-if="data.row.status == 'Approved'" type="success"> {{ data.row.status }} </el-text>
								<el-text class="status" size="small" v-if="data.row.status == 'Rejected'" type="danger"> {{ data.row.status }} </el-text>
							</template>
						</el-table-column>
						<el-table-column prop="action" label="Action" width="170">
							<template #default="data">
								<el-button class="action-button" type="info" @click="showForm('PreviewForm', data.row)"> Preview </el-button>
								<br />
								<el-button class="action-button" v-if="checkPermission('purchaseRequestHasRequestItems') && data.row.approved_by_cbo_name == null" type="info" @click="requestItem(data.row)"> Request Items </el-button>
								<br v-if="checkPermission('purchaseRequestHasRequestItems') && data.row.approved_by_cbo_name == null"/>
								<el-button class="action-button" v-if="checkPermission('purchaseRequestHasManageAttachments') && data.row.approved_by_cbo_name == null" type="info" @click="showForm('AttachmentsForm', data.row)"> Attachments </el-button>
								<br v-if="checkPermission('purchaseRequestHasManageAttachments') && data.row.approved_by_cbo_name == null"/>
								<el-button class="action-button" v-if="checkPermission('purchaseRequestHasUpdate') && data.row.approved_by_cbo_name == null" type="info" @click="showForm('UpdateForm', data.row)"> Update </el-button>
								<br v-if="checkPermission('purchaseRequestHasUpdate') && data.row.approved_by_cbo_name == null"/>
								<el-button class="action-button" v-if="checkPermission('purchaseRequestHasRemove') && data.row.approved_by_cbo_name == null" type="danger" @click="showForm('RemoveForm', data.row)"> Remove </el-button>
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

	.el-card {
		margin-top: 15px;
	}

	.el-pagination {
		justify-content: right;
	}
</style>