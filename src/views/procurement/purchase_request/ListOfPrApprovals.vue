<script lang='ts' setup>
	import { ref, reactive, onMounted, computed, watch } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { ComponentSize } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import { useDark } from '@vueuse/core'
	import { Search, ArrowDown, View, Files, Check, Clock, Refresh, Close } from '@element-plus/icons-vue'
	import axios from 'axios'
	import GeneralApprovalForm from '@/views/procurement/purchase_request/approval_form/GeneralApprovalForm.vue'
	import DetailsForm from '@/views/procurement/purchase_request/approval_form/DetailsForm.vue'
	import PreviewForm from '@/views/procurement/purchase_request/pr_form/PreviewForm.vue'
	import AttachmentForm from '@/components/dropzone/Dropzone.vue'
	import PendingForm from '@/views/procurement/purchase_request/approval_form/PendingForm.vue'
	import RejectForm from '@/views/procurement/purchase_request/approval_form/RejectForm.vue'

	const auth = useAuth()
	const isDark = useDark({ disableTransition: false })

	const listPrTableData = ref([])
	const clickedRow = ref([])
	const showDetailsForm = ref(false)
	const showPreviewForm = ref(false)
	const showAttachmentsForm = ref(false)
	const showRejectForm = ref(false)
	const showPendingForm = ref(false)
	const showGeneralApprovalForm = ref(false)
	const totalRecords = ref(1)
	const pageSize = ref(5)
	const currentPage = ref(1)
	const size = ref<ComponentSize>('default')
	const loading = ref(true)

	let userPromise = reactive({})
	let user = reactive({
		department: '',
		permissions: []
	})
	let searchValue = ref('')

	const checkPermission = (val: String) => {
		return user.permissions.includes(val)
	}

	const checkStatus = (val: String, data: Array) => {
		if (val == 'City Budget Office (CBO)')
			if (data.approved_by_cto_name)
				return false
		if (val == 'City Treasurer\'s Office (CTO)')
			if (data.approved_by_cmo_name)
				return false
		if (val == 'City Mayor\'s Office (CMO)')
			if (data.approved_by_bac_name)
				return false
		if (val == 'Bids and Awards Committee (BAC)')
			if (data.approved_by_cgso_name)
				return false
		if (val == 'City General Services Office (CGSO)')
			if (data.approved_by_cao_name)
				return false
		if (val == 'City Accountant\'s Office (CAccO)')
			if (data.approved_by_cao_name)
				return false

		return true
	}

	const showForm = (formName: string, data: Array) => {
		clickedRow.value = data
		if (formName === 'GeneralApprovalForm')
			showGeneralApprovalForm.value = true
		if (formName === 'DetailsForm')
			showDetailsForm.value = true
		if (formName === 'PendingForm')
			showPendingForm.value = true
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
			await axios.get(`${apiEndPoint}/api/list_of_pr/${pageSize.value}/?page=${currentPage.value}`, {
					params: { search: searchValue.value }
				}).then((res) => {
				listPrTableData.value = res.data.retrievedData
				totalRecords.value = res.data.total
			})

			showGeneralApprovalForm.value = false
			showDetailsForm.value = false
			showPreviewForm.value = false
			showPendingForm.value = false
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
				user.department = userPromise.department
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
		searchValue.value = ''
		loadPrData()
	}
	const handleCurrentChange = (val: number) => {
		searchValue.value = ''
		loadPrData()
	}

	const clearSearch = () => {
		searchValue.value = ''
		loadPrData()
	}

	const tagEffect = computed(() => {
		return isDark.value ? 'dark' : 'light'
	})

	watch(searchValue, (newValue) => {
		if (newValue.trim() === '') {
			loadPrData()
		}
    })

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
		<attachment-form :type="'pr'" :data="clickedRow" @attachmentUpdated="loadPrData(), searchValue = ''" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showDetailsForm" title="PR Details" :width="user.department == 'Bids and Awards Committee (BAC)' ? '800' : '400'">
		<details-form :data="clickedRow" :department="user.department" @updateButtonIsClicked="loadPrData(), searchValue = ''" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showGeneralApprovalForm" title="Approve PR" width="400">
		<general-approval-form :data="clickedRow" @approveButtonIsClicked="loadPrData(), searchValue = ''" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showPendingForm" title="Pending PR Form" width="400">
		<pending-form :data="clickedRow" @manageButtonIsClicked="loadPrData(), searchValue = ''" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showRejectForm" title="Reject PR Form" width="400">
		<reject-form :data="clickedRow" @manageButtonIsClicked="loadPrData(), searchValue = ''" />
	</el-dialog>

	<el-text class="title"> Purchase Requests </el-text>

	<el-card shadow="never">
		<el-skeleton animated :loading="loading">
			<template #template>
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
				<el-divider />
				<el-row>
					<el-col :span="16" />
					<el-col :span="8">
						<el-container class="search-area">
					      	<el-input v-model="searchValue" placeholder="Search" clearable @keyup.enter="loadPrData">
					      		<template #append>
									<el-button type="success"  @click="loadPrData" :icon="Search" />
								</template>
					      	</el-input>
				      	</el-container>
			      	</el-col>
		      	</el-row>
				<el-table :data="listPrTableData" border>
					<!-- <el-table-column type="expand">
						<template #default="data">
							Your Data Here
						</template>
					</el-table-column> -->
					<el-table-column prop="id" label-class-name="table-header" label="Tracking No." sortable />

					<el-table-column prop="pr_no" label="PR No." sortable>
						<template #default="data">
							<div>
								<el-text class="remarks" size="small" v-if="data.row.status == 'Rejected' && data.row.remarks" type="danger"> {{ data.row.remarks }} </el-text>
								<el-text class="remarks" size="small" v-if="data.row.status == 'Pending' && data.row.remarks" type="warning"> {{ data.row.remarks }} </el-text>
								<br v-if="(data.row.status == 'Rejected' || data.row.status == 'Pending') && data.row.remarks"/>
								<el-text size="large" class="pr-no" v-if="data.row.pr_no"> {{ data.row.pr_no }} </el-text>
								<br v-if="data.row.pr_no"/>
								<el-tag size="small" :effect="tagEffect" type="success"> {{ new Date(data.row.created_at).toDateString() }} </el-tag>
							</div>
						</template>
					</el-table-column>
					<el-table-column width="190px" prop="dep_sec" label="Requested By" sortable>
						<template #default="data">
							<el-text> {{ data.row.requested_by }} </el-text>
							<br />
							<el-text size="small"> <i> {{ data.row.department }} </i> </el-text>
						</template>
					</el-table-column>
					<!-- <el-table-column prop="cash_availability" label="Cash Availability" /> -->
					<el-table-column prop="fpp" label="FPP">
						<template #default="data">
							<span v-if="data.row.fpp"> {{ data.row.fpp }}</span>
							<center v-else class="n-a"> N/A </center>
						</template>
					</el-table-column>
					<el-table-column prop="fund" label="Fund" sortable>
						<template #default="data">
							<!-- ₱  -->
							<span v-if="data.row.fund"> {{ data.row.fund.split(' - ')[1] }}</span>
							<center v-else class="n-a"> N/A </center>
						</template>
					</el-table-column>

					<el-table-column prop="status" label="Status" width="150">
						<template #default="data">
							<el-text class="status" size="small" v-if="data.row.status == 'Pending'" type="warning"> {{ data.row.status }} </el-text>
							<el-text class="status" size="small" v-if="data.row.status == 'Approved'" type="success"> {{ data.row.status }} </el-text>
							<el-text class="status" size="small" v-if="data.row.status == 'Rejected'" type="danger"> {{ data.row.status }} </el-text>
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
										<el-dropdown-item @click="showForm('PreviewForm', data.row)"> <el-icon><View /></el-icon> Preview </el-dropdown-item>
										<el-dropdown-item v-if="checkPermission('purchaseRequestApprovalHasManageAttachments') && data.row.approved_by_cao_name == null && checkStatus(user.department, data.row)" @click="showForm('AttachmentsForm', data.row)"> <el-icon><Files /></el-icon> Attachments </el-dropdown-item>
										<el-dropdown-item v-if="checkPermission('purchaseRequestApprovalHasUpdateDetails') && data.row.approved_by_cao_name == null && checkStatus(user.department, data.row)" @click="showForm('DetailsForm', data.row)"> <el-icon><Refresh /></el-icon> Update Details </el-dropdown-item>
										<el-dropdown-item v-if="checkPermission('purchaseRequestApprovalHasGeneralApprove') && data.row.approved_by_cao_name == null && checkStatus(user.department, data.row)" @click="showForm('GeneralApprovalForm', data.row)"> <el-icon><Check /></el-icon> Approve </el-dropdown-item>
										<el-dropdown-item v-if="checkPermission('purchaseRequestApprovalHasPending') && data.row.approved_by_cao_name == null && checkStatus(user.department, data.row)" @click="showForm('PendingForm', data.row)"> <el-icon><Clock /></el-icon> Pending </el-dropdown-item>
										<el-dropdown-item v-if="checkPermission('purchaseRequestApprovalHasReject') && data.row.approved_by_cao_name == null && checkStatus(user.department, data.row)" @click="showForm('RejectForm', data.row)"> <el-text type="danger"> <el-icon><Close /></el-icon> Reject </el-text> </el-dropdown-item>
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
			</template>
		</el-skeleton>
	</el-card>
</template>

<style scoped>
	.title {
		font-size: 20px;
		font-weight: 400;
	}

	.pr-no {
		font-size: 15px;
		font-weight: 500;
	}

	.n-a {
		font-size: 10px;
		font-style: italic;
	}

	.status {
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.remarks {
		font-style: italic;
		font-weight: 400;
		font-size: 12px;
	}

	.el-card {
		margin-top: 15px;
		text-align: right;
	}

	.el-pagination {
		justify-content: right;
	}

	.search-area {
		margin-bottom: 20px;
	}
</style>