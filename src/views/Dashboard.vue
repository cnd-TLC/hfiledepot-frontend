<script lang='ts' setup>
	import { reactive, ref, onMounted, computed, watch } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { useTransition } from '@vueuse/core'
	import { DocumentChecked, DocumentDelete, Promotion, Check, Minus, Close, User, HelpFilled, Search } from '@element-plus/icons-vue'
	import { activities, apiEndPoint, frequentlyAskedQuestions } from '@/constant/data'
	import apexChartTotalApprovedRequests from '@/components/charts/ApexChartTotalApprovedRequests.vue'
	import apexChartTotalRequestsPerOffice from '@/components/charts/ApexChartTotalRequestsPerOffice.vue'
	import axios from 'axios'

	const auth = useAuth()

	const searchValue = ref('')
	const pageSize = ref(50)
	const approvedRequestChartKey = ref(0)
	const officeRequestChartKey = ref(0)
	const pending_count = ref(0)
	const pending_overall_count = ref(0)
	const approved_count = ref(0)
	const approved_overall_count = ref(0)
	const rejected_count = ref(0)
	const rejected_overall_count = ref(0)
	const notifications = ref([])
	const cbo_pending = ref([])
	const cto_pending = ref([])
	const cmo_pending = ref([])
	const bac_pending = ref([])
	const cgso_pending = ref([])
	const cao_pending = ref([])
	const listOfOnlineUsers = ref([])
	const requestingOffices = ref(Array(29).fill(0)) 
	const loadingApprovalRating = ref(true)
	const loadingOfficeRequests = ref(true)
	const loadingTimeline = ref(true)
	const loadingUser = ref(true)
	const searchOptionShow = ref(false)
	const selectedYear = ref(new Date())

	let userPromise = reactive({})
	let user = reactive({
		permissions: [],
	})

	const isLoading = computed(() => {
		if(loadingUser.value || loadingApprovalRating.value || loadingOfficeRequests.value  || loadingTimeline.value)
			return true
		return false
	})

	const reloadApprovedRequestChart = () => {
		approvedRequestChartKey.value += 1; 
	}

	const reloadOfficeRequestChart = () => {
		officeRequestChartKey.value += 1; 
	}

	const pendingValue = useTransition(pending_count, {
		duration: 1500,
	})

	const approvedValue = useTransition(approved_count, {
		duration: 1500,
	})

	const rejectedValue = useTransition(rejected_count, {
		duration: 1500,
	})

	const setAuthHeader = () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
	}

	const checkPermission = (val: String) => {
		return user.permissions.includes(val)
	}

	const getRequestsForApproval = () => {
		setAuthHeader()
		try {
			axios.get(`${apiEndPoint}/api/requests_for_approval/${selectedYear.value.getFullYear()}`).then((res) => {
				cbo_pending.value = res.data.cbo_pending ? res.data.cbo_pending : 0
				cto_pending.value = res.data.cto_pending ? res.data.cto_pending : 0
				cmo_pending.value = res.data.cmo_pending ? res.data.cmo_pending : 0
				bac_pending.value = res.data.bac_pending ? res.data.bac_pending : 0
				cgso_pending.value = res.data.cgso_pending ? res.data.cgso_pending : 0
				cao_pending.value = res.data.cao_pending ? res.data.cao_pending : 0
				reloadApprovedRequestChart()
				loadingApprovalRating.value = false
			})
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	}

	const getOfficeRequests = () => {
		setAuthHeader()
		try {
			axios.get(`${apiEndPoint}/api/requests_per_office/${selectedYear.value.getFullYear()}`).then((res) => {
	        	requestingOffices.value.fill(0) 

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

				loadingOfficeRequests.value = false
			})
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	}

	const parsePercentage = (number, overall) => {
		const precisionNumber = ((number / overall) * 100).toPrecision(2)
		return Number(precisionNumber).toLocaleString('en-US', { maximumFractionDigits: 0 })
	}

	const getDepartmentRequestscount = () => {
		setAuthHeader()
		try {
			axios.get(`${apiEndPoint}/api/department_requests_count/Pending/${selectedYear.value.getFullYear()}`).then((res) => {
				pending_count.value = res.data.count
				pending_overall_count.value = res.data.overall ? parsePercentage(pending_count.value, res.data.overall) : 0
			})
			axios.get(`${apiEndPoint}/api/department_requests_count/Approved/${selectedYear.value.getFullYear()}`).then((res) => {
				approved_count.value = res.data.count
				approved_overall_count.value = res.data.overall ? parsePercentage(approved_count.value, res.data.overall) : 0
			})
			axios.get(`${apiEndPoint}/api/department_requests_count/Rejected/${selectedYear.value.getFullYear()}`).then((res) => {
				rejected_count.value = res.data.count
				rejected_overall_count.value = res.data.overall ? parsePercentage(rejected_count.value, res.data.overall) : 0
			})
		}
		catch (err) {
			console.log('Error loading data: ', err)
		}
	}

	const getNotifications = () => {
		setAuthHeader()
		try {
			axios.get(`${apiEndPoint}/api/notifications/${selectedYear.value.getFullYear()}`).then((res) => {
				notifications.value = res.data.retrievedData
				loadingTimeline.value = false
			})
		}
		catch (err) {
			console.log('Error loading data: ', err)
		}
	}

	const loadOnlineUsersData = async () => {
		setAuthHeader()
		try {
			await axios.get(`${apiEndPoint}/api/list_of_online_users/${pageSize.value}/?page=1`, {
				params: { search: searchValue.value }
			}).then((res) => {
				listOfOnlineUsers.value = res.data.retrievedData
			})
		}
		catch (err) {
			ElMessage({
				message: `Cannot load sytem users: ${err.message}`,
				type: 'error',
			})
		}
	}

	const selectYear = () => {
		loadingApprovalRating.value = true
		loadingOfficeRequests.value = true
		loadingTimeline.value = true
		getDepartmentRequestscount()
		getRequestsForApproval()
		getOfficeRequests()
		getNotifications()
	}

	const getTimeDifference = (date1, date2) => {
	    let diff = Math.abs(date2.getTime() - date1.getTime());

	    let years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
	    let months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
	    let days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
	    let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	    let seconds = Math.floor((diff % (1000 * 60)) / 1000);

	    if (years > 0) return `${years}y`;
	    else if (months > 0) return `${months}m`;
	    else if (days > 0) return `${days}d`;
	    else if (hours > 0) return `${hours}h`; // Added hours
	    else if (minutes > 0) return `${minutes}min`;
	    else return `${seconds}s`;
	}

	const getUserData = async () => {
		try {
			await auth.fetch().then(res => {
				Object.assign(userPromise, res)
				userPromise = userPromise.data[0]
				user.permissions = JSON.parse(userPromise.permissions)
				loadingUser.value = false
 			})
		}
		catch (err) {
			console.log('Retrieving user data failed: ', err)
		}
	}

	const clearSearch = () => {
		searchValue.value = ''
		loadOnlineUsersData()
	}

	watch(searchValue, (newValue) => {
		if (newValue.trim() === '') {
			loadOnlineUsersData()
		}
    })

    watch(searchOptionShow, (newValue) => {
    	if (newValue == false)
			searchValue.value = ''    		
    })

	onMounted(() => {
		getUserData()
		getDepartmentRequestscount()
		getNotifications()
		getRequestsForApproval()
		getOfficeRequests()
		loadOnlineUsersData()
	})

</script>

<template>
	<div v-loading="isLoading" element-loading-text="Loading...">
		<el-text class="title"> Dashboard </el-text>
		<el-row>
			<el-col :span="18">
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
					<el-col :span="8" v-if="checkPermission('dashboardHasRequestCards')">
						<el-card shadow="never">
							<div class="summary-area">
								<div>
									<el-text class="dashboard-card-title"> Pending Requests </el-text>
									<br />
									<el-text class="summary-content">
										{{ Math.floor(pendingValue) }}
									</el-text>
									<br />
									<div class="statistic-footer">
							          <div class="footer-item">
							            <el-text :type="pending_overall_count > 3 ? 'success' : 'danger'">
							              {{ pending_overall_count }}%
							            </el-text>
							            <span class="overall-text"> of overall </span>
							          </div>
							        </div>
								</div>
								<!-- <el-icon><promotion :color="'#909399'" /></el-icon> -->
							</div>
						</el-card>
					</el-col>
					<el-col :span="8" v-if="checkPermission('dashboardHasRequestCards')">
						<el-card shadow="never" >
							<div class="summary-area">
								<div>
									<el-text class="dashboard-card-title"> Approved Requests </el-text>
									<br />
									<el-text class="summary-content">
										{{ Math.floor(approvedValue) }}
									</el-text>
									<br />
									<div class="statistic-footer">
							          <div class="footer-item">
							            <el-text :type="approved_overall_count > 3 ? 'success' : 'danger'">
							              {{ approved_overall_count }}%
							            </el-text>
							            <span class="overall-text"> of overall </span>
							          </div>
							        </div>
								</div>
								<!-- <el-icon><document-checked :color="'#67C23A'" /></el-icon> -->
							</div>
						</el-card>
					</el-col>
					<el-col :span="8" v-if="checkPermission('dashboardHasRequestCards')">
						<el-card shadow="never">
							<div class="summary-area">
								<div>
									<el-text class="dashboard-card-title"> Rejected Requests </el-text>
									<br />
									<el-text class="summary-content">
										{{ Math.floor(rejectedValue) }}
									</el-text>
									<br />
									<div class="statistic-footer">
							          <div class="footer-item">
							            <el-text :type="rejected_overall_count > 3 ? 'success' : 'danger'">
							              {{ rejected_overall_count }}%
							            </el-text>
							            <span class="overall-text"> of overall </span>
							          </div>
							        </div>
								</div>
								<!-- <el-icon><document-delete :color="'#F56C6C'" /></el-icon> -->
							</div>
						</el-card>
					</el-col>
					<el-col :span="24" >
						<el-card shadow="never">
							<el-text class="timeline-faq-card-title"> Request Status Timeline </el-text>
							<el-skeleton animated :loading="loadingTimeline">
								<template #template>
									<el-skeleton-item variant="text" v-for="n in 10" style="width: 100%"/>
								</template>
								<template #default>
									<el-timeline class="timeline" v-if="notifications.length != 0">
										<el-timeline-item
											v-for="(notification, index) in notifications"

											:key="index"
											:icon="notification.message.includes('Please') ? Minus : (notification.message.includes('pending') ? Minus : (notification.message.includes('approved') || notification.message.includes('updated') ? Check : Close))"
          									:type="notification.message.includes('Please') ? 'warning' : (notification.message.includes('pending') ? 'warning' : (notification.message.includes('approved') || notification.message.includes('updated') ? 'success' : 'danger'))"
											:size="'large'"
											:timestamp="new Date(notification.created_at).toLocaleString() "
											>
											<el-text> {{ notification.message }} </el-text>
										</el-timeline-item>
									</el-timeline>
									<el-text type="info" v-else> <center class="no-data"> <i> No data found </i> </center> </el-text>
								</template>
							</el-skeleton>
						</el-card>
					</el-col>
					<el-col :span="24" v-if="checkPermission('dashboardHasApprovalChart')">
						<el-card shadow="never" class="chart">
							<el-text class="chart-card-title"> Office Approval Ratings </el-text>
							<br />
							<el-skeleton animated :loading="loadingApprovalRating">
								<template #template>
									<el-skeleton-item variant="text" v-for="n in 10" style="width: 100%"/>
								</template>
								<template #default>
									<apex-chart-total-approved-requests :key="approvedRequestChartKey" :data="[cbo_pending, cto_pending, cmo_pending, bac_pending, cgso_pending, cao_pending]" />
								</template>
							</el-skeleton>
						</el-card>
					</el-col>
					<el-col :span="24" v-if="checkPermission('dashboardHasOfficeRequestChart')">
						<el-card shadow="never" class="chart">
							<el-text class="chart-card-title"> Total Requests per Office </el-text>
							<br />
							<el-skeleton animated :loading="loadingOfficeRequests">
								<template #template>
									<el-skeleton-item variant="text" v-for="n in 10" style="width: 100%"/>
								</template>
								<template #default>
									<apex-chart-total-requests-per-office :key="officeRequestChartKey" :data="requestingOffices" />
								</template>
							</el-skeleton>
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
				</el-row>
			</el-col>
			<el-col :span="6" class="accounts-col">
				<el-col :span="24">
					<el-text class="account-title"> 
						Recent Active Users
					</el-text>
					<el-switch
						v-model="searchOptionShow"
						inline-prompt
						active-text="Search"
						inactive-text="Search"
						style="--el-switch-on-color: #67c23a; --el-switch-off-color: #909399"
						size="small"
					/>
					<transition name="el-zoom-in-top">
						<el-input v-if="searchOptionShow" size="small" class="search-box" v-model="searchValue" placeholder="Search" clearable @keyup.enter="loadOnlineUsersData">
				      		<template #append>
								<el-button type="success"  @click="loadOnlineUsersData" :icon="Search" />
							</template>
				      	</el-input>
					</transition>
					<ul class="scroll-list">
						<li v-for="user in listOfOnlineUsers" :key="user.id" class="scroll-list-item">
							<div class="user-button">
								<div class="avatar">
									<el-avatar :size="40" :icon="User" />
								</div>
								<el-text class="name">
									{{ user.name }}
									<br />
									<span class="department"> {{ user.department }} </span>
								</el-text>
								<el-text class="status" :type="user.online ? 'success' : 'info'">
									<span v-if="user.online">Online</span>
									<span v-else>{{ getTimeDifference(new Date, new Date(user.last_online)) }}</span>
								</el-text>
							</div>
						</li>
					</ul>
				</el-col>
			</el-col>
		</el-row>
	</div>
</template>

<style scoped>
	.user-button {
		padding: 10px 10px;
		height: 50px;
		width: 100%;
		display: flex;
		text-align: left;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		border-radius: 5px;
	}

	.user-button:hover {
		border: 1px dotted #E5EAF3 ;
	}

	.user-button .avatar {
		margin-right: 10px;
		height: 40px;
		width: 40px;
	}

	.user-button .name {
		flex-grow: 1;
		margin-right: 10px;
		word-break: break-word;
		word-wrap: break-word;
		line-height: 14px;
	}

	.user-button .name .department {
		font-size: 10px;
		font-style: italic;
	}

	.user-button .status {
		font-size: 10px;
	}

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
		max-height: 430px;
		overflow-y: auto;
	}

	.timeline-col {
		margin-top: 51px !important;
	}

	.accounts-col {
		position: fixed;
		margin-top: -30px !important;
		right: 0px;
		width: 320px;
	}

	.timeline-faq-card-title {
		font-size: 14px;
		font-weight: 500;
	}

	.no-data {
		margin-top: 20px;
	}

	.dashboard-card-title {
		font-size: 14px;
/*		font-weight: 500;*/
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
/*		font-weight: 600;*/
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
	.statistic-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		font-size: 12px;
		color: var(--el-text-color-regular);
	}

	.statistic-footer .footer-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.overall-text {
		font-style: italic;
	}

	.statistic-footer .footer-item span:last-child {
		display: inline-flex;
		align-items: center;
		margin-left: 4px;
	}

	.footer-item .el-text .el-icon {
		font-size: 12px;
	}

	.el-loading-mask {
		z-index: 999;
	}

	.account-title {
		font-size: 12px;
		font-weight: 500;
		margin: 0 10px 0 10px;
	}

	.search-box {
		margin: 10px 0 0 0;
	}

	.scroll-list {
		overflow: auto;
		height: 85vh;
		padding: 0;
		margin: 10px 0 0 ;
		list-style: none;
		scrollbar-width: 0;
	}

	.scroll-list::-webkit-scrollbar {
		width: 0; /* For Chrome, Safari, and Opera */
		height: 0;
	}

	.scroll-list:hover::-webkit-scrollbar {
		width: 10px; /* For Chrome, Safari, and Opera */
		height: 10px;
	}

	.scroll-list:hover::-webkit-scrollbar-thumb {
		background-color: #ccc;
		border-radius: 10px;
	}

	.scroll-list:hover::-webkit-scrollbar-track {
		background-color: #f0f0f0;
		border-radius: 10px;
	}

	.scroll-list .scroll-list-item {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50px;
	}

	.scroll-list .scroll-list-item + .list-item {
		margin-top: 10px;
	}
</style>