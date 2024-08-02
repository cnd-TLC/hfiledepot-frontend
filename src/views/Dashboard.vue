<script setup>
	import { ref, onMounted } from 'vue'
	import { DocumentChecked, DocumentDelete, Promotion, InfoFilled } from '@element-plus/icons-vue'
	import { activities, apiEndPoint, frequentlyAskedQuestions } from '@/constant/data'
	import totalApprovedRequests from '@/components/charts/TotalApprovedRequests.vue'
	import totalRequestsPerOffice from '@/components/charts/TotalRequestsPerOffice.vue'
	import axios from 'axios'


	const approvedRequestChartKey = ref(0)
	const officeRequestChartKey = ref(0)
	const pending_count = ref(0)
	const approved_count = ref(0)
	const rejected_count = ref(0)
	const cbo_pending = ref([])
	const cto_pending = ref([])
	const cmo_pending = ref([])
	const bac_pending = ref([])
	const cgso_pending = ref([])
	const cao_pending = ref([])
	const requestingOffices = ref(Array(29).fill(0)) 
	const loadingPending = ref(false)
	const loadingApproved = ref(false)
	const loadingRejected = ref(false)
	const loadingApprovalRating = ref(false)
	const loadingOfficeRequests = ref(false)
	const selectedYear = ref(new Date())

	const reloadApprovedRequestChart = () => {
		approvedRequestChartKey.value += 1; 
	}

	const reloadOfficeRequestChart = () => {
		officeRequestChartKey.value += 1; 
	}

	const getRequestsForApproval = () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			axios.get(`${apiEndPoint}/api/requests_for_approval/${selectedYear.value.getFullYear()}`).then((res) => {
				cbo_pending.value = res.data.cbo_pending
				cto_pending.value = res.data.cto_pending
				cmo_pending.value = res.data.cmo_pending
				bac_pending.value = res.data.bac_pending
				cgso_pending.value = res.data.cgso_pending
				cao_pending.value = res.data.cao_pending
				reloadApprovedRequestChart()
				loadingApprovalRating.value = true
			})
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	}

	const getOfficeRequests = () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			axios.get(`${apiEndPoint}/api/requests_per_office/${selectedYear.value.getFullYear()}`).then((res) => {
				for (const office in res.data.retrievedData) {
					switch (office) {
				        case 'City Mayor\'s Office (CMO)':
				            requestingOffices.value[0] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Administrator\'s Office (CAdmO)':
				            requestingOffices.value[1] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Tourism Office (CToO)':
				            requestingOffices.value[2] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Planning and Development Office (CPDO)':
				            requestingOffices.value[3] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Budget Office (CBO)':
				            requestingOffices.value[4] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Accountant\'s Office (CAccO)':
				            requestingOffices.value[5] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City General Services Office (CGSO)':
				            requestingOffices.value[6] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Legal Office (CLO)':
				            requestingOffices.value[7] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Human Resource Management Office (CHRMO)':
				            requestingOffices.value[8] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Zoning Administration Office (CZAO)':
				            requestingOffices.value[9] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Treasurer\'s Office (CTO)':
				            requestingOffices.value[10] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Assessor\'s Office (CAsO)':
				            requestingOffices.value[11] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Civil Registrar\'s Office (CCRO)':
				            requestingOffices.value[12] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Health Office (CHO)':
				            requestingOffices.value[13] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Social Welfare and Development Office (CSWDO)':
				            requestingOffices.value[14] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Engineer\'s Office (CEO)':
				            requestingOffices.value[15] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Agriculture Services Office (CASO)':
				            requestingOffices.value[16] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Environment and Natural Resources Office (CENRO)':
				            requestingOffices.value[17] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Veterinary Office (CVO)':
				            requestingOffices.value[18] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Disaster and Risk Reduction Management Office (CDRRMO)':
				            requestingOffices.value[19] = res.data.retrievedData[`${office}`];
				            break;
				        case 'Permits and Licensing (PL)':
				            requestingOffices.value[20] = res.data.retrievedData[`${office}`];
				            break;
				        case 'Public Information (PI)':
				            requestingOffices.value[21] = res.data.retrievedData[`${office}`];
				            break;
				        case 'BAPAS (BAPAS)':
				            requestingOffices.value[22] = res.data.retrievedData[`${office}`];
				            break;
				        case 'Traffic and Security (TS)':
				            requestingOffices.value[23] = res.data.retrievedData[`${office}`];
				            break;
				        case 'Market Operations (MO)':
				            requestingOffices.value[24] = res.data.retrievedData[`${office}`];
				            break;
				        case 'DILG-Sorsogon City (DILG)':
				            requestingOffices.value[25] = res.data.retrievedData[`${office}`];
				            break;
				        case 'Sangguniang Panlungsod (SP)':
				            requestingOffices.value[26] = res.data.retrievedData[`${office}`];
				            break;
				        case 'City Information and Communications Technology Office (CICTO)':
				            requestingOffices.value[27] = res.data.retrievedData[`${office}`];
				            break;
				        case 'Bids and Awards Committee (BAC)':
				            requestingOffices.value[28] = res.data.retrievedData[`${office}`];
				            break;
				        default:
				            break;
				    }
				}
				reloadOfficeRequestChart()

				loadingOfficeRequests.value = true
			})
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	}

	const getDepartmentRequestscount = () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			axios.get(`${apiEndPoint}/api/department_requests_count/Pending/${selectedYear.value.getFullYear()}`).then((res) => {
				pending_count.value = res.data.count
				loadingPending.value = true
			})
			axios.get(`${apiEndPoint}/api/department_requests_count/Approved/${selectedYear.value.getFullYear()}`).then((res) => {
				approved_count.value = res.data.count
				loadingApproved.value = true
			})
			axios.get(`${apiEndPoint}/api/department_requests_count/Rejected/${selectedYear.value.getFullYear()}`).then((res) => {
				loadingRejected.value = true
				rejected_count.value = res.data.count
			})
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	}

	const selectYear = () => {
		loadingPending.value = false
		loadingApproved.value = false
		loadingRejected.value = false
		loadingApprovalRating.value = false
		loadingOfficeRequests.value = false
		getDepartmentRequestscount()
		getRequestsForApproval()
		getOfficeRequests()
	}

	onMounted(() => {
		getDepartmentRequestscount()
		getRequestsForApproval()
		getOfficeRequests()
	})

</script>

<template>
	<el-text class="title"> Dashboard </el-text>
	<el-row>
		<el-col :span="16">
			<el-col :span="24" class="date-picker">
				<el-form-item label="Select Year">
					<el-date-picker
						v-model="selectedYear"
						type="year"
						placeholder="Pick a year"
						@change="selectYear"
				    />
				</el-form-item>
			</el-col>
			<el-row>
				<el-col :span="8">
					<el-card shadow="never">
						<div class="summary-area">
							<div>
								<el-skeleton animated :loading="!loadingPending">
									<template #template>
										<el-skeleton-item variant="text" style="width: 50%; height: 26px" />
									</template>
									<template #default>
										<el-text class="summary-content" type="info">
											{{ pending_count }}
										</el-text>
									</template>
								</el-skeleton>
								<br />
								<el-text class="dashboard-card-title" type="info"> Pending Requests </el-text>
							</div>
							<el-icon><promotion :color="'#909399'" /></el-icon>
						</div>
					</el-card>
				</el-col>
				<el-col :span="8">
					<el-card shadow="never" >
						<div class="summary-area">
							<div>
								<el-skeleton animated :loading="!loadingApproved">
									<template #template>
										<el-skeleton-item variant="text" style="width: 50%; height: 26px" />
									</template>
									<template #default>
										<el-text class="summary-content" type="success">
											{{ approved_count }}
										</el-text>
									</template>
								</el-skeleton>
								<br />
								<el-text class="dashboard-card-title" type="success"> Approved Requests </el-text>
							</div>
							<el-icon><document-checked :color="'#67C23A'" /></el-icon>
						</div>
					</el-card>
				</el-col>
				<el-col :span="8">
					<el-card shadow="never">
						<div class="summary-area">
							<div>
								<el-skeleton animated :loading="!loadingRejected">
									<template #template>
										<el-skeleton-item variant="text" style="width: 50%; height: 26px" class="summary-content"/>
									</template>
									<template #default>
										<el-text class="summary-content" type="danger">
											{{ rejected_count }}
										</el-text>
									</template>
								</el-skeleton>
								<br />
								<el-text class="dashboard-card-title" type="danger"> Rejected Requests </el-text>
							</div>
							<el-icon><document-delete :color="'#F56C6C'" /></el-icon>
						</div>
					</el-card>
				</el-col>
				<el-col :span="24">
					<el-card shadow="never" class="chart">
						<el-text class="chart-card-title"> Office Approval Ratings </el-text>
						<br />
						<el-skeleton animated :loading="!loadingApprovalRating">
							<template #template>
								<el-skeleton-item variant="text" v-for="n in 10" style="width: 100%" class="summary-content"/>
							</template>
							<template #default>
								<total-approved-requests :key="approvedRequestChartKey" :data="[cbo_pending, cto_pending, cmo_pending, bac_pending, cgso_pending, cao_pending]" />
							</template>
						</el-skeleton>
					</el-card>
				</el-col>
				<el-col :span="24">
					<el-card shadow="never" class="chart">
						<el-text class="chart-card-title"> Total Requests per Office </el-text>
						<br />
						<el-skeleton animated :loading="!loadingOfficeRequests">
							<template #template>
								<el-skeleton-item variant="text" v-for="n in 10" style="width: 100%" class="summary-content"/>
							</template>
							<template #default>
								<total-requests-per-office :key="approvedRequestChartKey" :data="requestingOffices" />
							</template>
						</el-skeleton>
					</el-card>
				</el-col>
			</el-row>
		</el-col>
		<el-col :span="8" class="timeline-col">
			<el-col :span="24" >
				<el-card shadow="never">
					<el-text class="timeline-faq-card-title"> Request Status Timeline </el-text>
					<el-scrollbar class="scrollbar">
						<el-timeline class="timeline">
							<el-timeline-item
								v-for="(activity, index) in activities"
								:key="index"
								:icon="activity.icon"
								:type="activity.type"
								:color="activity.color"
								:size="activity.size"
								:hollow="activity.hollow"
								:timestamp="activity.timestamp"
							>
							{{ activity.content }}
							</el-timeline-item>
						</el-timeline>
					</el-scrollbar>
				</el-card>
			</el-col>
			<el-col :span="24">
				<el-card shadow="never">
					<el-text class="timeline-faq-card-title"> FAQs </el-text>
					<el-collapse class="faqs">
						<el-collapse-item v-for="(faq, index) in frequentlyAskedQuestions" :name="index">
							<template #title>
								<div>
									<el-text> 
										{{ faq.question }} 
									</el-text>
								</div>
							</template>
							<el-text class="answer-accordion">
								{{ faq.answer }}
							</el-text>
						</el-collapse-item>
					</el-collapse>
				</el-card>
			</el-col>
		</el-col>
	</el-row>
</template>

<style>
	.title {
		font-size: 20px;
		font-weight: 400;
	}

	.apex-chart {
		width: 100% !important;
	}

	.chart {
		text-align: center;
	}

	.chart-card-title {
		font-size: 20px;
		font-weight: 500;
	}

	.scrollbar {
		height: 400px;
	}

	.faqs {
		margin-top: 25px;
	}

	.answer-accordion {
		display: block;
		text-align: justify;
	}

	.timeline {
		margin-top: 20px;
		padding: 0 10px;
	}

	.timeline-col {
		margin-top: 51px !important;
	}

	.timeline-faq-card-title {
		font-size: 15px;
		font-weight: 500;
	}

	.dashboard-card-title {
		font-size: 15px;
		font-weight: 500;
	}
	
	.summary-area {
		display: flex !important; 
		justify-content: space-between !important; 
		align-items: center
	}

	.summary-area .el-icon {
		font-size: 40px
	}

	.summary-content {
		font-size: 35px;
		font-weight: 600;
	}

	.loading-dashboard {
		height: 500px; 
		align-items: center; 
		align-content: center; 
		text-align: center;
	}

	.date-picker {
		margin-top: 20px;
	}

	.date-picker .el-form-item {
		padding: 0;
		margin: 0;
	}

	.el-col {
		padding: 0 5px;
	}

	.el-card {
		margin-top: 15px;
	}

	.el-collapse-item__header {
		line-height: normal;
		align-items: center;
		text-align: left;
	}
</style>