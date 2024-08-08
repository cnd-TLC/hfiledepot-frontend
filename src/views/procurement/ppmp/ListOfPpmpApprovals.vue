<script lang='ts' setup>
	import { ref, reactive, onMounted, computed, watch } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { ComponentSize } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import { useDark } from '@vueuse/core'
	import { Search, ArrowDown, View, Files, Check, Close } from '@element-plus/icons-vue'
	import axios from 'axios'
	import ApprovalForm from '@/views/procurement/ppmp/approval_form/ApprovalForm.vue'
	import RejectForm from '@/views/procurement/ppmp/approval_form/RejectForm.vue'
	import PreviewForm from '@/views/procurement/ppmp/ppmp_form/PreviewForm.vue'
	import AttachmentForm from '@/components/dropzone/Dropzone.vue'
	
	const auth = useAuth()
	const isDark = useDark({ disableTransition: false })

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
	let searchValue = ref('')

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
			await axios.get(`${apiEndPoint}/api/list_of_ppmp/${pageSize.value}/?page=${currentPage.value}`, {
					params: { search: searchValue.value }
				}).then((res) => {
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
		searchValue.value = ''
		loadPpmpData()
	}
	const handleCurrentChange = (val: number) => {
		searchValue.value = ''
		loadPpmpData()
	}

	const clearSearch = () => {
		searchValue.value = ''
		loadPpmpData()
	}

	const tagEffect = computed(() => {
		return isDark.value ? 'dark' : 'light'
	})

	watch(searchValue, (newValue) => {
		if (newValue.trim() === '') {
			loadPpmpData()
		}
    })

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
	<el-dialog destroy-on-close :overflow="false" v-model="showApprovalForm"  title="Approve PPMP" width="400">
		<approval-form :data="clickedRow" @manageStatusButtonIsClicked="loadPpmpData(), searchValue = ''" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showPreviewForm" title="PPMP Details" width="95%">
		<preview-form :data="clickedRow" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showAttachmentsForm" title="PPMP Attachments" width="600">
		<attachment-form :type="'ppmp'" :data="clickedRow" @attachmentUpdated="loadPpmpData(), searchValue = ''" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showRejectForm"  title="Reject PPMP" width="400">
		<reject-form :data="clickedRow" @manageStatusButtonIsClicked="loadPpmpData(), searchValue = ''" />
	</el-dialog>

	<el-text class="title"> Procurement Project Management Plans </el-text>

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
				<div class="custom-card">
					<el-divider />
					<el-row>
						<el-col :span="16" />
						<el-col :span="8">
							<el-container class="search-area">
						      	<el-input v-model="searchValue" placeholder="Search" clearable @keyup.enter="loadPpmpData">
						      		<template #append>
										<el-button type="success"  @click="loadPpmpData" :icon="Search" />
									</template>
						      	</el-input>
					      	</el-container>
				      	</el-col>
			      	</el-row>
					<el-table :data="listPpmpRequestTableData" border>
						<el-table-column label="Project" sortable>
							<template #default="data">
								<el-text class="remarks" size="small" v-if="data.row.status == 'Rejected' && data.row.remarks" type="danger"> {{ data.row.remarks }} </el-text>
								<br v-if="data.row.status == 'Rejected' && data.row.remarks"/>
								<el-text class="project-title"> {{ data.row.title }} </el-text>
								<br />
								<el-tag size="small" :effect="tagEffect" type="success"> {{ data.row.year }} </el-tag>
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

						<el-table-column prop="action" label="Action" width="120">
							<template #default="data">
								<el-dropdown trigger="click">
									<el-button type="info" class="action-button">
										Action &nbsp; <el-icon><arrow-down /></el-icon>
	  								</el-button>
									<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item class="action-button" @click="showForm('PreviewForm', data.row)"> <el-icon><View /></el-icon> Preview Items </el-dropdown-item>
										<el-dropdown-item class="action-button" v-if="checkPermission('managePpmpHasManageAttachments') && data.row.status == 'Pending'" @click="showForm('AttachmentsForm', data.row)"> <el-icon><Files /></el-icon> Attachments </el-dropdown-item>
										<el-dropdown-item class="action-button" v-if="checkPermission('ppmpApprovalHasApprove')" @click="showForm('ApprovalForm', data.row)"> <el-icon><Check /></el-icon> Approve </el-dropdown-item>
										<el-dropdown-item class="action-button" v-if="checkPermission('ppmpApprovalHasReject')" @click="showForm('RemoveForm', data.row)"> <el-text type="danger"> <el-icon><Close /></el-icon> Reject </el-text> </el-dropdown-item> 
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

	.project-title {
		font-size: 15px;
		font-weight: 500;
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

	.search-area {
		margin-bottom: 20px;
	}
</style>