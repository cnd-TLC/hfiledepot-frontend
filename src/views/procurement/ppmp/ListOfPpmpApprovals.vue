<script lang='ts' setup>
	import { ref, reactive, onMounted } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { ComponentSize } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'
	import ApprovalForm from '@/views/procurement/ppmp/approval_form/ApprovalForm.vue'
	import RejectForm from '@/views/procurement/ppmp/approval_form/RejectForm.vue'
	import PreviewForm from '@/views/procurement/ppmp/ppmp_form/PreviewForm.vue'
	import AttachmentForm from '@/components/dropzone/Dropzone.vue'
	
	const auth = useAuth()

	const listPpmpRequestTableData = ref([])
	const clickedRow = ref([])
	const showApprovalForm = ref(false)
	const showPreviewForm = ref(false)
	const showAttachmentsForm = ref(false)
	const showRejectForm = ref(false)
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
		if (formName === 'ApprovalForm')
			showApprovalForm.value = true
		if (formName === 'PreviewForm')
			showPreviewForm.value = true
		if (formName === 'AttachmentsForm')
			showAttachmentsForm.value = true
		if (formName === 'RemoveForm')
			showRejectForm.value = true
	}

	const loadPpmpData = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			await axios.get(apiEndPoint + '/api/list_of_ppmp/' + pageSize.value + '/?page=' + currentPage.value).then((res) => {
				listPpmpRequestTableData.value = res.data.retrievedData
				totalRecords.value = res.data.total
			})

			showPreviewForm.value = false
			showApprovalForm.value = false
			showRejectForm.value = false
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
		loadPpmpData()
	}
	const handleCurrentChange = (val: number) => {
		loadPpmpData()
	}

	onMounted(() => {
		try {
			loadPpmpData()
			getUserData()
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	})
</script>

<template>
	<el-dialog destroy-on-close :overflow="false" v-model="showApprovalForm"  title="PPMP Details" width="400">
		<approval-form :data="clickedRow" @manageStatusButtonIsClicked="loadPpmpData" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showPreviewForm" title="PPMP Details" width="95%">
		<preview-form :data="clickedRow" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showAttachmentsForm" title="PR Attachments" width="600">
		<attachment-form :type="'ppmp'" :data="clickedRow" @attachmentUpdated="loadPpmpData" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showRejectForm"  title="Reject PPMP" width="400">
		<reject-form :data="clickedRow" @manageStatusButtonIsClicked="loadPpmpData" />
	</el-dialog>

	<el-text class="title"> Procurement Project Management Plans </el-text>

	<el-card shadow="never">
		<el-skeleton animated :loading="loading">
			<template #template>
				<div class="custom-card">
					<el-skeleton-item variant="button" style="width: 10%" />
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
					<el-divider />
					<el-table :data="listPpmpRequestTableData" stripe border>
						<el-table-column label="Project" sortable>
							<template #default="data">
								<el-text> {{ data.row.title }} </el-text>
								<br />
								<el-text> {{ data.row.year }} </el-text>
							</template>
						</el-table-column>
						<el-table-column prop="pmo_end_user_dept" label="PMO End-User / Department" sortable/>
						<el-table-column prop="source_of_funds" label="Source of Fund" />
						<el-table-column prop="status" label="Status" width="150">
							<template #default="data">
								<el-text class="status" size="small" v-if="data.row.status == 'Pending'" type="warning"> {{ data.row.status }} </el-text>
								<el-text class="status" size="small" v-if="data.row.status == 'Approved'" type="success"> {{ data.row.status }} </el-text>
								<el-text class="status" size="small" v-if="data.row.status == 'Rejected'" type="danger"> {{ data.row.status }} </el-text>
							</template>
						</el-table-column>

						<el-table-column prop="action" label="Action" width="170">
							<template #default="data">
								<el-button class="action-button" type="info" @click="showForm('PreviewForm', data.row)"> Preview Items </el-button>
								<br />
								<el-button class="action-button" v-if="checkPermission('managePpmpHasManageAttachments') && data.row.status == 'Pending'" type="info" @click="showForm('AttachmentsForm', data.row)"> Attachments </el-button>
								<br v-if="checkPermission('managePpmpHasManageAttachments') && data.row.status == 'Pending'"/>
								<el-button class="action-button" v-if="checkPermission('ppmpApprovalHasApprove')" type="success" @click="showForm('ApprovalForm', data.row)"> Approve </el-button>
								<br v-if="checkPermission('ppmpApprovalHasApprove')" />
								<el-button class="action-button" v-if="checkPermission('ppmpApprovalHasReject')" type="danger" @click="showForm('RemoveForm', data.row)"> Reject </el-button>
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