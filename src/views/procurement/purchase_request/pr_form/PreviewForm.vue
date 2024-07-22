<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import type { FormProps, UploadUserFile } from 'element-plus'
	import { Check, Document } from '@element-plus/icons-vue'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'

	const labelPosition = ref<FormProps['labelPosition']>('top')

	const listPrItemTableData = ref([])
	const loading = ref(true)
	const pageSize = ref(0)
	const overallCost = ref(0)
	const activeCount = ref(1)

	const props = defineProps({
		data: Object
	})

	const activities = [
		{
			office: 'Requesting Office',
			details: 'Submitted by ' + props.data.requested_by,
			timestamp: '',
			size: 'large',
			type: 'success',
			icon: Check,
		},
		{
			office: 'Budget Office',
			details: props.data.approved_by_cbo_name ? 'Approved by ' + props.data.approved_by_cbo_name : '',
			timestamp: '',
			size: 'large',
			type: props.data.approved_by_cbo_name ? 'success' : 'info',
			icon: props.data.approved_by_cbo_name ? Check : '',
		},
		{
			office: 'City Treasurer',
			details: props.data.approved_by_cbo_name ? 'Approved by ' + props.data.approved_by_cbo_name : '',
			timestamp: '',
			size: 'large',
			type: props.data.approved_by_cbo_name ? 'success' : 'info',
			icon: props.data.approved_by_cbo_name ? Check : '',
		},
		{
			office: 'Mayor',
			details: props.data.approved_by_cbo_name ? 'Approved by ' + props.data.approved_by_cbo_name : '',
			timestamp: '',
			size: 'large',
			type: props.data.approved_by_cbo_name ? 'success' : 'info',
			icon: props.data.approved_by_cbo_name ? Check : '',
		},
		{
			office: 'BAC',
			details: props.data.approved_by_cbo_name ? 'Approved by ' + props.data.approved_by_cbo_name : '',
			timestamp: '',
			size: 'large',
			type: props.data.approved_by_cbo_name ? 'success' : 'info',
			icon: props.data.approved_by_cbo_name ? Check : '',
		},
		{
			office: 'CGSO',
			details: props.data.approved_by_cbo_name ? 'Approved by ' + props.data.approved_by_cbo_name : '',
			timestamp: '',
			size: 'large',
			type: props.data.approved_by_cbo_name ? 'success' : 'info',
			icon: props.data.approved_by_cbo_name ? Check : '',
		},
		{
			office: 'Accounting',
			details: props.data.approved_by_cbo_name ? 'Approved by ' + props.data.approved_by_cbo_name : '',
			timestamp: '',
			size: 'large',
			type: props.data.approved_by_cbo_name ? 'success' : 'info',
			icon: props.data.approved_by_cbo_name ? Check : '',
		},
	]

	const printPrButtonIsDisabled = ref(false)

	const prFormData = reactive({
	  pr_no: props.data.pr_no,
	  section: props.data.section,
	  department: props.data.department,
	  fund: props.data.fund,
	  fpp: props.data.fpp,
	  purpose: props.data.purpose,
	  created_at: '',
	  attachments: JSON.parse(props.data.attachments)
	})

	const formatNumber = (number: Integer) => {
		number = parseFloat(number).toFixed(2)
		let numStr = number.toString();
	    let parts = numStr.split(".");
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    return parts.join(".");
	}


	const loadPrItemData = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			await axios.get(apiEndPoint + '/api/list_of_pr_items/' + props.data.id + '/' + pageSize.value).then((res) => {
				listPrItemTableData.value = res.data.retrievedData
				const calculateEstBudget = listPrItemTableData.value.reduce((acc, current) => {
				  return acc + (parseFloat(current.unit_cost) * parseInt(current.quantity));
				}, 0);
				overallCost.value = calculateEstBudget.toFixed(2)
			})
		}
		catch (err) {
			console.log('Error loading data', err)
		}
		finally {
			loading.value = false
		}
	}

	const printPrForm = async () => {
		try{
			printPrButtonIsDisabled.value = true
			// prItemFormData.attachments[0].name
			// router.push({ name: 'request_items' })
			console.log(prFormData)
		}
		catch (err) {
			console.log('Cannot print form: ', err)
		}
		finally {
			printPrButtonIsDisabled.value = false
		}
	}

	const extractFileName = (path) => {
		const startIndex = path.lastIndexOf('/') + 1
		const filename = path.substring(startIndex)
		return filename.split('~-~')[1]
	};

	const generateRandomString = (length) => {
		const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		let randomString = ''
		for (let i = 0; i < length; i++) {
		    const randomIndex = Math.floor(Math.random() * charset.length)
		    randomString += charset[randomIndex]
		}
		return randomString
	}
	
	const downloadFile = (index) => {
		axios.get(apiEndPoint + '/api/download_attachment/' + prFormData.attachments[index], {
			responseType: 'blob'
		})
		.then((res) =>{
			const contentDisposition = res.headers['content-disposition']
			let filename = generateRandomString(20)

			const blob = new Blob([res.data], { type: res.headers['content-type'] })
			const link = document.createElement('a')
			link.href = window.URL.createObjectURL(blob)
			link.setAttribute('download', filename)
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
		})
	}

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
			console.log('Error loading data', err)
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
					:description="activity.details + activity.timestamp"
				/>
			</el-steps>
		</el-col>
		<el-col :span="1"/>
	</el-row>
	<el-divider />
	<el-form :model="prFormData" label-width="auto" :label-position="labelPosition">
		<el-row>
			<el-col :span="6" class="space-attachments">
	    	<el-form-item label="Attachments">
					<el-skeleton animated :loading="loading">
			      <template #template>
			        <el-skeleton-item v-for="n in 5" variant="text" style="width: 100%" />
			      </template>
			      <template #default>
			        <div v-if="prFormData.attachments != null">
			          	<li v-for="(item, index) in prFormData.attachments" :key="index" class="item-display" >
			            <el-text class="file-name" @click="downloadFile(index)"> <el-icon><document /></el-icon> {{ extractFileName(item) }} </el-text>
			          </li>
				        <div class="no-attachment" v-if="prFormData.attachments.length == 0">
				            <el-text type="info"> No attachments found</el-text>
				        </div>
			        </div>
			        <div class="no-attachment" v-else>
			            <el-text type="info"> No attachments found</el-text>
			        </div>
			      </template>
			    </el-skeleton>
				</el-form-item>
	    </el-col>
	    <el-col :span="18">
	    	<el-form-item>
	 			<el-col :span="8" class="input-area">
			    	<el-form-item label="LGU : Sorsogon City">
			     		<el-input v-model="prFormData.department" readonly/>
			    	</el-form-item>
			    </el-col>
	    		<el-col :span="8" class="input-area">
	    			<el-form-item label="PR Number">
			     		<el-input v-model="prFormData.pr_no" readonly/>
			    	</el-form-item>
	    		</el-col>
	 			<el-col :span="8">
				    <el-form-item label="Date">
				      	<el-input v-model="prFormData.created_at" readonly/>
				    </el-form-item>
				</el-col>
	    	</el-form-item>
	    	<el-form-item class="form-item-top-padding">
	 			<el-col :span="8" class="input-area">
			    	<el-form-item label="Section">
			     		<el-input v-model="prFormData.section" readonly/>
			    	</el-form-item>
			    </el-col>
	    		<el-col :span="8" class="input-area">
	    			<el-form-item label="FPP">
			     		<el-input v-model="prFormData.fpp" readonly/>
			    	</el-form-item>
	    		</el-col>
	 			<el-col :span="8">
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
				<el-table :data="listPrItemTableData" stripe >
					<el-table-column prop="item_no" label="Item No." sortable />
					<el-table-column prop="unit" label="Unit" sortable />
					<el-table-column prop="item_description" label="Item Description" sortable />
					<el-table-column prop="quantity" label="Quantity" />
					<el-table-column label="Unit Cost">
						<template #default="data">
							<el-text> ₱ {{ formatNumber(data.row.unit_cost) }} </el-text>
						</template>
					</el-table-column>
					<el-table-column label="Total Cost">
						<template #default="data">
							<el-text> ₱ {{ formatNumber(data.row.unit_cost * data.row.quantity) }} </el-text>
							</template>
					</el-table-column>
				</el-table>
				<div style="text-align: right;">
					<div shadow="never" class="total-card">
						<el-text class="total"> Total : </el-text>
						<el-text class="total number"> ₱ {{ formatNumber(overallCost) }} </el-text>
					</div>
				</div>
			</template>
		</el-skeleton>
		<el-divider />
	    <el-button size="large" class="print-width" type="success" @click="printPrForm" :disabled="printPrButtonIsDisabled"> Print </el-button> 
	</el-form>
</template>

<style scoped>
	.pr-details-container {
		padding-right: 10px;
		border-right: 1px solid var(--el-border-color-light);
	}

	.print-width {
		display: block;
		float: right;
		width: 10%;
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

	.el-timeline {
		margin-top: 20px;
	}

	.space-attachments {
		padding: 5px;
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