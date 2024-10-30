<script lang="ts" setup>
	import { reactive, ref, onMounted, computed } from 'vue'
	import type { FormProps } from 'element-plus'
	import { Check, Document } from '@element-plus/icons-vue'
	import { useDark } from '@vueuse/core'
	import { apiEndPoint } from '@/constant/data'
	import { formatNumber, downloadBlob, downloadPr } from '@/constant/functions'
	import { PDFDocument } from 'pdf-lib';
	import { ElMessage } from 'element-plus'
	import sorCityLogo from '/images/sorsogoncity.png'
	import QRCodeVue3 from 'qrcode-vue3'
	import axios from 'axios'

	const labelPosition = ref<FormProps['labelPosition']>('top')
	const isDark = useDark({ disableTransition: false })

	const listPrItemTableData = ref([])
	const loading = ref(true)
	const pageSize = ref(0)
	const overallCost = ref(0)
	const activeCount = ref(1)

	const props = defineProps({
		data: Object
	})

	const getLastApproved = () => {
		if(props.data.approved_by_cbo_name)
			return Math.floor((new Date() - new Date(props.data.approved_by_cbo)) / (1000 * 60 * 60 * 24))
		if(props.data.approved_by_cto_name)
			return Math.floor((new Date() - new Date(props.data.approved_by_cto)) / (1000 * 60 * 60 * 24))
		if(props.data.approved_by_cmo)
			return Math.floor((new Date() - new Date(props.data.approved_by_cmo)) / (1000 * 60 * 60 * 24))
		if(props.data.approved_by_bac_name)
			return Math.floor((new Date() - new Date(props.data.approved_by_bac)) / (1000 * 60 * 60 * 24))
		if(props.data.approved_by_cgso_name)
			return Math.floor((new Date() - new Date(props.data.approved_by_cgso)) / (1000 * 60 * 60 * 24))
		
		return 0
	}


	const activities = [
		{
			office: 'Requesting Office',
			details: `Submitted by ${props.data.requested_by}`,
			timestamp: new Date(props.data.created_at).toDateString(),
			size: 'large',
			type: 'success',
			icon: Check,
		},
		{
			office: 'Budget Office',
			details: props.data.approved_by_cbo_name ? `Approved by ${props.data.approved_by_cbo_name}` : '',
			timestamp: props.data.approved_by_cbo_name ? new Date(props.data.approved_by_cbo).toDateString() : '',
			size: 'large',
			type: props.data.approved_by_cbo_name ? 'success' : 'info',
			icon: props.data.approved_by_cbo_name ? Check : '',
		},
		{
			office: 'City Treasurer',
			details: props.data.approved_by_cto_name ? `Approved by ${props.data.approved_by_cto_name}` : '',
			timestamp: props.data.approved_by_cto_name ? new Date(props.data.approved_by_cto).toDateString() : '',
			size: 'large',
			type: props.data.approved_by_cto_name ? 'success' : 'info',
			icon: props.data.approved_by_cto_name ? Check : '',
		},
		{
			office: 'Mayor',
			details: props.data.approved_by_cmo_name ? `Approved by ${props.data.approved_by_cmo_name}` : '',
			timestamp: props.data.approved_by_cmo_name ? new Date(props.data.approved_by_cmo).toDateString() : '',
			size: 'large',
			type: props.data.approved_by_cmo_name ? 'success' : 'info',
			icon: props.data.approved_by_cmo_name ? Check : '',
		},
		{
			office: 'BAC',
			details: props.data.approved_by_bac_name ? `Approved by ${props.data.approved_by_bac_name}` : '',
			timestamp: props.data.approved_by_bac_name ? new Date(props.data.approved_by_bac).toDateString() : '',
			size: 'large',
			type: props.data.approved_by_bac_name ? 'success' : 'info',
			icon: props.data.approved_by_bac_name ? Check : '',
		},
		{
			office: 'CGSO',
			details: props.data.approved_by_cgso_name ? `Approved by ${props.data.approved_by_cgso_name}` : '',
			timestamp: props.data.approved_by_cgso_name ? new Date(props.data.approved_by_cgso).toDateString() : '',
			size: 'large',
			type: props.data.approved_by_cgso_name ? 'success' : 'info',
			icon: props.data.approved_by_cgso_name ? Check : '',
		},
		{
			office: 'Accounting',
			details: props.data.approved_by_cao_name ? `Approved by ${props.data.approved_by_cao_name}` : '',
			timestamp: props.data.approved_by_cao_name ? new Date(props.data.approved_by_cao).toDateString() : '',
			size: 'large',
			type: props.data.approved_by_cao_name ? 'success' : 'info',
			icon: props.data.approved_by_cao_name ? Check : '',
		},
	]

	const printPrButtonIsDisabled = ref(false)

	const prFormData = {
		id: props.data.id,
		pr_no: props.data.pr_no,
		section: props.data.section,
		department: props.data.department,
		fund: props.data.fund ? props.data.fund.split(' - ')[1] : '',
		fpp: props.data.fpp,
		status: props.data.status,
		purpose: props.data.purpose,
		remarks: props.data.remarks,
		created_at: new Date(props.data.created_at).toDateString(),
		attachments: JSON.parse(props.data.attachments),
		updated_since: getLastApproved(),
		bac_resolution: props.data.bac_resolution,
		canvass: props.data.canvass,
		purchase_order: props.data.purchase_order,
		obr: props.data.obr,
		ris: props.data.ris,
		inspection_acceptance: props.data.inspection_acceptance,
		abstract: props.data.abstract,
		voucher: props.data.voucher,
		notice_of_awards: props.data.notice_of_awards,
		notice_to_proceed: props.data.notice_to_proceed,
		contract_of_agreement: props.data.contract_of_agreement,
		lcrb: props.data.lcrb,
	}

	const setAuthHeader = () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
	}

	const loadPrItemData = async () => {
		setAuthHeader()
		try {
			await axios.get(`${apiEndPoint}/api/list_of_pr_items/${props.data.id}/${pageSize.value}`).then((res) => {
				listPrItemTableData.value = res.data.retrievedData
				const calculateEstBudget = listPrItemTableData.value.reduce((acc, current) => {
					if (current.lumpsum)
						return acc + (parseFloat(current.unit_cost))
					return acc + (parseFloat(current.unit_cost) * parseInt(current.quantity));
				}, 0);
				overallCost.value = calculateEstBudget.toFixed(2)
			})
		}
		catch (err) {
			ElMessage({
				message: `Error loading data: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			loading.value = false
		}
	}

	const printPrForm = async () => {
		try{
			printPrButtonIsDisabled.value = true
			downloadPr(prFormData, listPrItemTableData)
		}
		catch (err) {
			ElMessage({
				message: `Cannot print form: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			printPrButtonIsDisabled.value = false
		}
	}

	const pingLatest = async () => {
		setAuthHeader()
		try{
			await axios.post(`${apiEndPoint}/api/ping/${props.data.id}/${props.data.approved_by_cbo_name}/${props.data.approved_by_cto_name}/${props.data.approved_by_cmo_name}/${props.data.approved_by_bac_name}/${props.data.approved_by_cgso_name}/${props.data.approved_by_cao_name}/`).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
				})
		}
		catch (err) {
			ElMessage({
				message: `Cannot ping: ${err.message}`,
				type: 'error',
			})
		}
	}

	const extractFileName = (path) => {
		const startIndex = path.lastIndexOf('/') + 1
		const filename = path.substring(startIndex)
		return filename.split('~-~')[1]
	}

	const downloadFile = (index) => {
		axios.get(`${apiEndPoint}/api/download_attachment/${prFormData.attachments[index]}`, {
			responseType: 'blob'
		})
		.then((res) =>{
			downloadBlob(res)
		})
	}

	const tagEffect = computed(() => {
		return isDark.value ? 'dark' : 'light'
	})

	onMounted(() => {
		if (props.data.approved_by_cbo_name){
			activeCount.value++
			if (props.data.approved_by_cto_name){
				activeCount.value++
				if (props.data.approved_by_cmo_name){
					activeCount.value++
					if (props.data.approved_by_bac_name){
						activeCount.value++
						if(props.data.approved_by_cgso_name){
							activeCount.value++
							if (props.data.approved_by_cao_name)
								activeCount.value++
						}
					}
				}
			}
		}

		try {
			loadPrItemData()
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
	<el-row style="padding-top: 20px;">
		<el-col :span="1"/>
		<el-col :span="22">
			<el-steps style="max-width: 100%" :active="activeCount" finish-status="success">
				<el-step
					v-for="(activity, index) in activities"
					:title="activity.office"
				>
					<template #description>
						<div v-if="activity.details">
							{{ activity.details }} on
							<br />
							{{ activity.timestamp }}
						</div>
					</template>
				</el-step>
			</el-steps>
		</el-col>
		<el-col :span="1"/>
	</el-row>
	<el-divider />
	<el-form :model="prFormData" label-width="auto" :label-position="labelPosition">
		<el-row>
		    <el-col :span="18">
		    	<div v-if="props.data.approved_by_cbo_name && prFormData.updated_since != 0 && !props.data.approved_by_cao_name && prFormData.status != 'Rejected'">
			    	<el-alert :title="prFormData.updated_since > 1 ? `${ prFormData.updated_since } days since last approved` : `${ prFormData.updated_since } day since last approved`" type="success" :effect="tagEffect" :closable="false" />
			    	<br />
			    </div>
			    <el-row>
			    	<el-col :span="6">
			    		<center class="qr-code">
					    	<QRCodeVue3
				          :width="200"
				          :height="200"
				          :value="`${apiEndPoint}/api/get_pr/${prFormData.id}`"
				          :qrOptions="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }"
				          :image="sorCityLogo"
				          :imageOptions="{ hideBackgroundDots: true, imageSize: 0.2, margin: 0 }"
				          :dotsOptions="{
				            type: 'square',
				            color: '#555',
				            // gradient: {
				            //   type: 'linear',
				            //   rotation: 0,
				            //   colorStops: [
				            //     { offset: 0, color: '#529b2e' },
				            //     { offset: 1, color: '#529b2e' },
				            //   ],
				            // },
				          }"
				          :backgroundOptions="{ color: '#ffffff' }"
				          :cornersSquareOptions="{ type: 'square', color: '#555' }"
				          :cornersDotOptions="{ type: 'square', color: '#555' }"
				          fileExt="png"
				        />
				      </center>
			    	</el-col>
			    	<el-col :span="18">
					    <div v-if="prFormData.status == 'Rejected'">
					    	<el-alert v-if="prFormData.remarks" :title='`PR REJECTED with the following reason(s): "${prFormData.remarks}"`' type="error" :effect="tagEffect" :closable="false" />
					    	<el-alert v-else :title="`PR REJECTED`" type="error" :effect="tagEffect" :closable="false" />
					    	<br />
					    </div>
					    <div v-if="prFormData.status == 'Pending'">
					    	<el-alert v-if="prFormData.remarks" :title='`PR SET TO PENDING with the following reason(s): "${prFormData.remarks}"`' type="warning" :effect="tagEffect" :closable="false" />
					    	<br />
					    </div>
				    	<el-form-item>
					 			<el-col :span="16" class="input-area">
						    	<el-form-item label="LGU : Sorsogon City" class="input-area">
						     		<el-input v-model="prFormData.department" readonly/>
						    	</el-form-item>
						    </el-col>
				    		<el-col :span="8">
				    			<el-form-item label="PR Number">
						     		<el-input v-model="prFormData.pr_no" readonly/>
						    	</el-form-item>
				    		</el-col>
				    	</el-form-item>
				    	<el-form-item class="form-item-top-padding">
					 			<el-col :span="5" class="input-area">
							    <el-form-item label="Date">
							      	<el-input v-model="prFormData.created_at" readonly/>
							    </el-form-item>
								</el-col>
				    		<el-col :span="7">
				    			<el-form-item label="FPP" class="input-area">
						     		<el-input v-model="prFormData.fpp" readonly/>
						    	</el-form-item>
				    		</el-col>
					 			<el-col :span="12">
							    <el-form-item label="Fund">
							      	<el-input v-model="prFormData.fund" readonly/>
							    </el-form-item>
								</el-col>
				    	</el-form-item>
				    	<el-form-item label="Purpose of Request" class="form-item-top-padding">
					      	<el-input v-model="prFormData.purpose" type="textarea" readonly/>
				    	</el-form-item>
				    </el-col>
				</el-row>

				<el-skeleton animated :loading="loading">
					<template #template>
						<el-skeleton-item v-for="n in 10" variant="text" style="width: 100%" />
					</template>
					<template #default>
						<div class="table-border">
							<el-table :data="listPrItemTableData" stripe >
								<el-table-column prop="item_description" label="Item Description" sortable>
									<template #default="data">
										<el-text size="small" > {{ data.row.item_no }} </el-text>
										<br />
										<el-text class="item-description"> {{ data.row.item_description }} </el-text>
										<br />
										<el-text class="category"> <i> {{ data.row.category }} </i> </el-text>

									</template>
								</el-table-column>
								<el-table-column prop="quantity" label="Quantity" width="120">
									<template #default="data">
										<el-text v-if="!data.row.lumpsum"> {{ data.row.quantity }} {{ data.row.unit }}<span v-if="data.row.unit != null">(s)</span> </el-text>
											<el-text v-else>
												{{ data.row.quantity }} <span class="lumpsum">Lumpsum</span>
											</el-text>
									</template>
								</el-table-column>
								<el-table-column label="Unit Cost" width="170">
									<template #default="data">
										<el-text> ₱ {{ formatNumber(data.row.unit_cost) }} </el-text>
									</template>
								</el-table-column>
								<el-table-column label="Total Cost" width="170">
									<template #default="data">
										<el-text> ₱ 
											<span v-if="data.row.lumpsum"> {{ formatNumber(data.row.unit_cost) }} </span> 
											<span v-else> {{ formatNumber(data.row.unit_cost * data.row.quantity) }} </span> 
										</el-text>
									</template>
								</el-table-column>
							</el-table>
							<div style="text-align: right;">
								<div shadow="never" class="total-card">
									<el-text class="total"> Total : </el-text>
									<el-text class="total number"> ₱ {{ formatNumber(overallCost) }} </el-text>
								</div>
							</div>
						</div>
					</template>
				</el-skeleton>
		    </el-col>
		    <el-col :span="6" class="space-attachments">
		    	<el-form-item label="Inclusions">
						<template #label> 
	 						<el-text class="sub-module-title" type="danger">
		    					Inclusions
		    				</el-text>
	 					</template>
						<el-row>
							<el-col :span="24">
								<el-text class="inclusions" v-if="prFormData.bac_resolution"> <el-icon><Check /></el-icon> with BAC Resolution ({{ new Date(prFormData.bac_resolution).toDateString() }}) </el-text>
								<br v-if="prFormData.bac_resolution" />
								<el-text class="inclusions" v-if="prFormData.canvass"> <el-icon><Check /></el-icon> with Canvass ({{ new Date(prFormData.canvass).toDateString() }}) </el-text>
								<br v-if="prFormData.canvass" />
								<el-text class="inclusions" v-if="prFormData.purchase_order"> <el-icon><Check /></el-icon> with Purchase Order ({{ new Date(prFormData.purchase_order).toDateString() }}) </el-text>
								<br v-if="prFormData.purchase_order" />
								<el-text class="inclusions" v-if="prFormData.obr"> <el-icon><Check /></el-icon> with OBR ({{ new Date(prFormData.obr).toDateString() }}) </el-text>
								<br v-if="prFormData.obr" />
								<el-text class="inclusions" v-if="prFormData.ris"> <el-icon><Check /></el-icon> with RIS ({{ new Date(prFormData.ris).toDateString() }}) </el-text>
								<br v-if="prFormData.ris" />
								<el-text class="inclusions" v-if="prFormData.inspection_acceptance"> <el-icon><Check /></el-icon> with Inspection/Acceptance ({{ new Date(prFormData.inspection_acceptance).toDateString() }}) </el-text>
								<br v-if="prFormData.inspection_acceptance" />
								<el-text class="inclusions" v-if="prFormData.abstract"> <el-icon><Check /></el-icon> with Abstract ({{ new Date(prFormData.abstract).toDateString() }}) </el-text>
								<br v-if="prFormData.abstract" />
								<el-text class="inclusions" v-if="prFormData.voucher"> <el-icon><Check /></el-icon> with Voucher ({{ new Date(prFormData.voucher).toDateString() }}) </el-text>
								<br v-if="prFormData.voucher" />
								<el-text class="inclusions" v-if="prFormData.notice_of_awards"> <el-icon><Check /></el-icon> with Notice of Awards ({{ new Date(prFormData.notice_of_awards).toDateString() }}) </el-text>
								<br v-if="prFormData.notice_of_awards" />
								<el-text class="inclusions" v-if="prFormData.notice_to_proceed"> <el-icon><Check /></el-icon> with Notice to Proceed ({{ new Date(prFormData.notice_to_proceed).toDateString() }}) </el-text>
								<br v-if="prFormData.notice_to_proceed" />
								<el-text class="inclusions" v-if="prFormData.contract_of_agreement"> <el-icon><Check /></el-icon> with Contract of Agreement ({{ new Date(prFormData.contract_of_agreement).toDateString() }}) </el-text>
								<br v-if="prFormData.contract_of_agreement" />
								<el-text class="inclusions" v-if="prFormData.lcrb"> <el-icon><Check /></el-icon> with LCRB ({{ new Date(prFormData.lcrb).toDateString() }}) </el-text>
								<br v-if="prFormData.lcrb" />
						        <div v-if="prFormData.bac_resolution == null && prFormData.canvass == null && prFormData.purchase_order == null && prFormData.obr == null && prFormData.ris == null && prFormData.inspection_acceptance == null && prFormData.abstract == null && prFormData.voucher == null && prFormData.notice_of_awards == null && prFormData.notice_to_proceed == null && prFormData.contract_of_agreement == null && prFormData.lcrb == null" >
						            <el-text type="info"> No inclusions found</el-text>
						        </div>
							</el-col>
						</el-row>
					</el-form-item>
					<el-form-item label="Attachments">
						<template #label>
							<el-text class="sub-module-title" type="danger">
	    					Attachments
	    				</el-text>
						</template>
						<el-skeleton animated :loading="loading">
				      <template #template>
				        <el-skeleton-item v-for="n in 2" variant="text" style="width: 100%" />
				      </template>
				      <template #default>
				        <div v-if="prFormData.attachments != null">
				          	<li v-for="(item, index) in prFormData.attachments" :key="index" class="item-display" >
				            <el-text class="file-name" @click="downloadFile(index)"> <el-icon><document /></el-icon> {{ extractFileName(item) }} </el-text>
				          </li>
					        <div v-if="prFormData.attachments.length == 0">
					            <el-text type="info"> No attachments found</el-text>
					        </div>
				        </div>
				        <div v-else>
				            <el-text type="info"> No attachments found</el-text>
				        </div>
				      </template>
				    </el-skeleton>
					</el-form-item>
		    </el-col>
		</el-row>
		<el-divider />
    <el-button size="large" class="print-width" type="success" @click="printPrForm" :disabled="printPrButtonIsDisabled"> Print </el-button> 
    <el-button size="large" class="print-width" type="warning" @click="pingLatest" v-if="props.data.status == 'Pending'"> Ping </el-button> 
	</el-form>
</template>

<style scoped>
	.table-border {
		margin-top: 20px;
		border: 1px solid var(--el-border-color-light);
	}

	.qr-code {
		margin-top: 30px;
	}

	.print-width {
		margin-left: 10px;
		display: block;
		float: right;
		width: 10%;
	}

	.item-description {
		font-size: 15px;
		font-weight: 500;
	}

	.lumpsum {
		font-style: italic;
		font-weight: 400;
		font-size: 12px;
	}

	.category {
		font-size: 10px;
		line-height: -10;
	}

	.inclusions {
		font-size: 13px;
		line-height: -10;
	}

	.input-area {
		padding: 0 10px 0 0;
	}

	.total-card {
		margin: 20px 20px !important;
	}

	.total {
		font-size: 20px;
		font-weight: 500;
	}

	.form-item-top-padding {
		padding-top: 10px;
	}

	.el-form {
		padding-bottom: 40px;
	}

	.sub-module-title {
		font-size: 14px;
		font-weight: 500;
	}

	.el-timeline {
		margin-top: 20px;
	}

	.space-attachments {
		padding: 0 20px;
	}

	.item-display {
		display: flex;
		justify-content: space-between;
		align-items: center;
		list-style-type: none;
		border-radius: 2px;
		margin: 4px 0;
	}

	.file-name:hover {
		text-decoration: underline;
		color: #409eff;
	}

	.item-display .el-icon:hover {
		font-size: 15px;
	}

	.item-display .el-icon, .file-name {
		cursor: pointer;
	}  
</style>