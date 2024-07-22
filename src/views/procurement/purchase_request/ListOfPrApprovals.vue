<script lang='ts' setup>
	import { ref, reactive, onMounted } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { ComponentSize } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'
	import GeneralApprovalForm from '@/views/procurement/purchase_request/approval_form/GeneralApprovalForm.vue'
	import ApprovalForm from '@/views/procurement/purchase_request/approval_form/ApprovalForm.vue'
	import PreviewForm from '@/views/procurement/purchase_request/pr_form/PreviewForm.vue'
	import AttachmentForm from '@/components/dropzone/Dropzone.vue'
	import RejectForm from '@/views/procurement/purchase_request/approval_form/RejectForm.vue'

	const auth = useAuth()

	const listPrTableData = ref([])
	const clickedRow = ref([])
	const showApprovalForm = ref(false)
	const showUpdateApprovalForm = ref(false)
	const showPreviewForm = ref(false)
	const showAttachmentsForm = ref(false)
	const showRejectForm = ref(false)
	const showGeneralApprovalForm = ref(false)
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

	const showForm = (formName: string, data: Array) => {
		clickedRow.value = data
		if (formName === 'GeneralApprovalForm')
			showGeneralApprovalForm.value = true
		if (formName === 'ApprovalForm')
			showApprovalForm.value = true
		if (formName === 'UpdateForm')
			showUpdateApprovalForm.value = true
		if (formName === 'PreviewForm')
			showPreviewForm.value = true
		if (formName === 'AttachmentsForm')
			showAttachmentsForm.value = true
		if (formName === 'RejectForm')
			showRejectForm.value = true
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
			await axios.get(apiEndPoint + '/api/list_of_pr/' + pageSize.value + '/?page=' + currentPage.value).then((res) => {
				listPrTableData.value = res.data.retrievedData
				totalRecords.value = res.data.total
			})

			showGeneralApprovalForm.value = false
			showApprovalForm.value = false
			showUpdateApprovalForm.value = false
			showPreviewForm.value = false
			// showAttachmentsForm.value = false
			showRejectForm.value = false
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
	<el-dialog destroy-on-close :overflow="false" v-model="showApprovalForm" title="PR Details" width="400">
		<approval-form :data="clickedRow" @updateButtonIsClicked="loadPrData" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showUpdateApprovalForm" title="PR Details" width="400">
		<approval-form :data="clickedRow" @updateButtonIsClicked="loadPrData" :update="true" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showGeneralApprovalForm" title="PR Details" width="400">
		<general-approval-form :data="clickedRow" @approveButtonIsClicked="loadPrData" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showRejectForm" title="Reject" width="400">
		<reject-form :data="clickedRow" @rejectButtonIsClicked="loadPrData" />
	</el-dialog>

	<el-text class="title"> Purchase Requests </el-text>

	<el-card shadow="never">
		<el-skeleton animated :loading="loading">
			<template #template>
				<el-divider />
				<el-skeleton-item v-for="n in 10" variant="text" style="width: 100%" />
				<el-divider />
				<div class="custom-card">
					<el-skeleton-item variant="rect" style="width: 40%" />
				</div>
			</template>
			<template #default>
				<el-divider />
				<el-table :data="listPrTableData" stripe border>
					<!-- <el-table-column type="expand">
						<template #default="data">
							Your Data Here
						</template>
					</el-table-column> -->
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
								<el-text size="large"> {{ data.row.fund }} </el-text>
							</template>
						</el-table-column>

					<el-table-column prop="status" label="Status" width="150">
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
							<el-button class="action-button" v-if="checkPermission('purchaseRequestApprovalHasManageAttachments') && data.row.approved_by_cao_name == null" type="info" @click="showForm('AttachmentsForm', data.row)"> Attachments </el-button>
								<br v-if="checkPermission('purchaseRequestApprovalHasManageAttachments') && data.row.approved_by_cao_name == null"/>
							<el-button class="action-button" v-if="checkPermission('purchaseRequestApprovalHasGeneralApprove')" type="success" @click="showForm('GeneralApprovalForm', data.row)"> Approve </el-button>
							<br v-if="checkPermission('purchaseRequestApprovalHasGeneralApprove')"/>
							<el-button class="action-button" v-if="checkPermission('purchaseRequestApprovalHasBacApprove')" type="success" @click="showForm('ApprovalForm', data.row)"> Approve [BAC] </el-button>
							<br v-if="checkPermission('purchaseRequestApprovalHasBacApprove')"/>
							<el-button class="action-button" v-if="checkPermission('purchaseRequestApprovalHasUpdate')" type="info" @click="showForm('UpdateForm', data.row)"> Update </el-button>
							<br v-if="checkPermission('purchaseRequestApprovalHasUpdate')"/>
							<el-button class="action-button" v-if="checkPermission('purchaseRequestApprovalHasReject')" type="danger" @click="showForm('RejectForm', data.row)"> Reject </el-button>
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

	.el-card {
		margin-top: 15px;
		text-align: right;
	}

	.el-pagination {
		justify-content: right;
	}
</style>