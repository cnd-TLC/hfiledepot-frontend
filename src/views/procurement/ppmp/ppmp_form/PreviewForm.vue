<script lang='ts' setup>
	import { ref, reactive, onMounted } from 'vue'
	import { ComponentSize, FormProps } from 'element-plus'
	import { Document } from '@element-plus/icons-vue'
	import { formatNumber, downloadBlob } from '@/constant/functions'
	import { apiEndPoint } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const totalEstimatedBudget = ref(0)
	const listPpmpItemTableData = ref([])
	const labelPosition = ref<FormProps['labelPosition']>('top')
	const pageSize = ref(0)
	const loading = ref(true)

	const props = defineProps({
		data: Object
	})

	const ppmpFormData = reactive({
	  attachments: JSON.parse(props.data.attachments)
	})

	const loadPpmpItemData = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			await axios.get(`${apiEndPoint}/api/list_of_ppmp_items/${props.data.id}/${pageSize.value}`).then((res) => {
				listPpmpItemTableData.value = res.data.retrievedData
				const calculateEstBudget = listPpmpItemTableData.value.reduce((acc, current) => {
				  return acc + parseFloat(current.estimated_budget);
				}, 0);
				totalEstimatedBudget.value = calculateEstBudget.toFixed(2)
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

	const extractFileName = (path) => {
		const startIndex = path.lastIndexOf('/') + 1
		const filename = path.substring(startIndex)
		return filename.split('~-~')[1]
	};
	
	const downloadFile = (index) => {
		axios.get(`${apiEndPoint}/api/download_attachment/${ppmpFormData.attachments[index]}`, {
			responseType: 'blob'
		})
		.then((res) =>{
			downloadBlob(res)
		})
	}

	onMounted(() => {
		try {
			loadPpmpItemData()
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
	<el-form :model="ppmpFormData" :label-position="labelPosition" label-width="auto">
		<el-row>
	    <el-col :span="18">
				<div style="text-align: right;">
					<el-skeleton animated :loading="loading">
						<template #template>
							<el-skeleton-item v-for="n in 10" variant="text" style="width: 100%" />
						</template>
						<template #default>
							<div class="table-border">
								<el-table :data="listPpmpItemTableData" stripe>
									<el-table-column type="expand">
										<template #default="data">
											<el-form class="custom-form" label-width="auto" :label-position="labelPosition">
												<el-form-item class="form-item-top-padding">
											    	<template #label>
														<el-divider>
															<el-text class="schedule-title">
																Schedule / Milestone of Activities
															</el-text> 
														</el-divider> 
											    	</template>
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
										    		<el-col :span="12" class="input-area form-item-top-padding">
											    		<el-form-item>
											    			<template #label>
											    				<el-text class="quarter-title" type="danger">
											    					3rd Quarter
											    				</el-text>
											    			</template>
											    			<el-col :span="8" class="input-area">
											    				<el-form-item label="July">
															      	<el-input :value="data.row.jul" readonly />
																</el-form-item>
											    			</el-col>
											    			<el-col :span="8" class="input-area">
											    				<el-form-item label="August">
															      	<el-input :value="data.row.aug" readonly />
																</el-form-item>
											    			</el-col>
											    			<el-col :span="8">
											    				<el-form-item label="September">
															      	<el-input :value="data.row.sept" readonly />
																</el-form-item>
											    			</el-col>
											    		</el-form-item>
											    	</el-col>
										    		<el-col :span="12" class="form-item-top-padding">
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
															      	<el-input :value="data.row.nov" readonly />
																</el-form-item>
											    			</el-col>
											    			<el-col :span="8">
											    				<el-form-item label="December">
															      	<el-input :value="data.row.dec" readonly />
																</el-form-item>
											    			</el-col>
											    		</el-form-item>
											    	</el-col>
											    </el-form-item>
											</el-form>
										</template>
									</el-table-column>
									<el-table-column prop="code" label="Code" sortable width="200" />
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
									<el-table-column label="Est. Budget" width="150">
										<template #default="data">
											<el-text> ₱ {{ formatNumber(data.row.estimated_budget) }} </el-text>
						 				</template>
									</el-table-column>
								</el-table>
								<div class="total-card">
									<el-text class="total"> Total : </el-text>
									<el-text class="total number"> ₱ {{ formatNumber(totalEstimatedBudget) }} </el-text>
								</div>
							</div>
						</template>
					</el-skeleton>
				</div>
			</el-col>
			<el-col :span="6" class="space-attachments">
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
			        <div v-if="ppmpFormData.attachments != null">
			          	<li v-for="(item, index) in ppmpFormData.attachments" :key="index" class="item-display" >
			            <el-text class="file-name" @click="downloadFile(index)"> <el-icon><document /></el-icon> {{ extractFileName(item) }} </el-text>
			          </li>
				        <div class="no-attachment" v-if="ppmpFormData.attachments.length == 0">
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
		</el-row>
		<el-divider />
	  <!-- <el-button size="large" class="print-width" type="success" @click="printPpmpForm" :disabled="printPpmpButtonIsDisabled"> Print </el-button>  -->
	</el-form>
</template>

<style scoped>
	.table-border {
		border: 1px solid var(--el-border-color-light);
	}

	.sub-module-title {
		font-size: 14px;
		font-weight: 500;
	}

	.print-width {
		display: block;
		float: right;
		width: 10%;
	}

	.lumpsum {
		font-style: italic;
		font-weight: 400;
		font-size: 12px;
	}

	.custom-form {
		padding: 10px;
	}

	.schedule-title {
		font-size: 16px;
		font-weight: 500;
	}

	.quarter-title {
		font-size: 14px;
		font-weight: 500;
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

	.el-form {
		padding-bottom: 40px;
	}

	.el-card {
		margin-top: 15px;
	}

	.el-pagination {
		justify-content: right;
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