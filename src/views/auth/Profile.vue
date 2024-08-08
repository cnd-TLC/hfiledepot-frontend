<script lang='ts' setup>
	import { ref, reactive, onMounted } from 'vue'
	import { useAuth } from 'vue-auth3'
	import type { FormProps } from 'element-plus'
	import { ElMessage } from 'element-plus'
	import { apiEndPoint, listOfDepartments } from '@/constant/data'
	import axios from 'axios'
	import LogoutForm from '@/views/auth/LogoutForm.vue'

	const emit = defineEmits(['updateUserInfo'])
	const labelPosition = ref<FormProps['labelPosition']>('top')

	const auth = useAuth()
	const sessionHistory = ref([])
	const systemUserRoleOption = ref([])
	const showLogoutAll = ref(false)
	const roleLoading = ref(true)
	const userInformationLoading = ref(true)
	const updateUserButtonIsDisabled = ref(false)
	const updatePasswordButtonIsDisabled = ref(false)

	let userPromise = reactive({})

	const systemUserFormData = reactive({
		id: '',
		name: '',
		email: '',
		username: '',
		department: '',
		role: '',
		status: 'Active',
		old_password: '',
		new_password: '',
		retype_password: ''
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

	const updateUserInfo = async () => {
		setAuthHeader()
		try{
			updateUserButtonIsDisabled.value = true
			await axios.put(`${apiEndPoint}/api/update_users/${systemUserFormData.id}`, {
				name: systemUserFormData.name,
				email: systemUserFormData.email,
				username: systemUserFormData.username,
				department: systemUserFormData.department,
				role: systemUserFormData.role,
				status: systemUserFormData.status,
			}).then((res) => {
				ElMessage({
					message: res.data.message,
					type: 'success',
				})
			})
		}
		catch (err) {
			ElMessage({
				message: `Cannot submit form: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			updateUserButtonIsDisabled.value = false
			emit('updateUserInfo')
		}
	}

	const updatePassword = async () => {
		setAuthHeader()
		try{
			updatePasswordButtonIsDisabled.value = true
			await axios.put(`${apiEndPoint}/api/update_password`, {
				old_password: systemUserFormData.old_password,
				new_password: systemUserFormData.new_password,
				retype_password: systemUserFormData.retype_password,
			}).then((res) => {
				ElMessage({
					message: res.data.message,
					type: res.data.status == 'success' ? 'success' : 'error',
				})
				systemUserFormData.old_password = ''
				systemUserFormData.new_password = ''
				systemUserFormData.retype_password = ''
			})
		}
		catch (err) {
			ElMessage({
				message: `Cannot submit form: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			updatePasswordButtonIsDisabled.value = false
			emit('updateUserInfo')
		}
	}

	const getOSFromUserAgent = (userAgent) => {
	    let os = "Unknown"

	    if (userAgent.indexOf("Windows NT 10.0") !== -1)
	        os = "Windows 10"
	    else if (userAgent.indexOf("Windows NT 6.3") !== -1)
	        os = "Windows 8.1"
	    else if (userAgent.indexOf("Windows NT 6.2") !== -1)
	        os = "Windows 8"
	    else if (userAgent.indexOf("Windows NT 6.1") !== -1)
	        os = "Windows 7"
	    else if (userAgent.indexOf("Windows NT 6.0") !== -1)
	        os = "Windows Vista"
	    else if (userAgent.indexOf("Windows NT 5.1") !== -1)
	        os = "Windows XP"
	    else if (userAgent.indexOf("Mac OS X") !== -1)
	        os = "Mac OS X"
	    else if (userAgent.indexOf("Android") !== -1)
	        os = "Android"
	    else if (userAgent.indexOf("Linux") !== -1 && userAgent.indexOf("Android") === -1)
	        os = "Linux"
	    else if (userAgent.indexOf("iPhone") !== -1)
	        os = "iOS (iPhone)"
	    else if (userAgent.indexOf("iPad") !== -1)
	        os = "iOS (iPad)"

	    return os;
	}

	const getBrowserIcon = (browser) => {
		switch (browser) {
			case 'Mozilla Firefox':
				return { iconClass: 'fab fa-firefox', color: 'red' }; // Use a color name or hex value
			case 'Google Chrome':
				return { iconClass: 'fab fa-chrome', color: '#4285F4' }; // Google Chrome color
			case 'Microsoft Edge':
				return { iconClass: 'fab fa-edge', color: '#0078D4' }; // Microsoft Edge color
			case 'Safari':
				return { iconClass: 'fab fa-safari', color: '#0B98E0' }; // Apple Safari color
			case 'Internet Explorer':
				return { iconClass: 'fab fa-internet-explorer', color: '#0078D4' }; // IE color
			default:
				return { iconClass: 'fas fa-question-circle', color: 'gray' }; // Fallback icon for unknown browsers
      }
    }

	const getBrowserInfo = (userAgent) => {
	    let browser = 'Unknown';
	    let version = 'Unknown';
	    let iconUrl = 'https://upload.wikimedia.org/wikipedia/commons/7/74/Unknown.png'; // Fallback icon

	    const browsers = [
	        { name: 'Mozilla Firefox', pattern: /Firefox\/(\d+(\.\d+)?)/ },
	        { name: 'Google Chrome', pattern: /Chrome\/(\d+(\.\d+)?)/ },
	        { name: 'Microsoft Edge', pattern: /Edg\/(\d+(\.\d+)?)/ },
	        { name: 'Safari', pattern: /Version\/(\d+(\.\d+)?).*Safari/ },
	        { name: 'Internet Explorer', pattern: /MSIE\s(\d+(\.\d+)?)/ },
	        { name: 'Internet Explorer', pattern: /Trident.*rv:(\d+(\.\d+)?)/ }
	    ];

	    // Check for the last browser in the user agent string
	    for (const { name, pattern, icon } of browsers) {
	        const match = userAgent.match(pattern);
	        if (match) {
	            browser = name;
	            version = match[1] || 'Unknown';
	            iconUrl = icon; // Update icon URL based on the matched browser
	        }
	    }

	    return { browser, version, iconUrl };
	}

	const getHistorySessions = async () => {
		setAuthHeader()

		try {
			await axios.get(`${apiEndPoint}/api/active_sessions`).then((res) => {
				sessionHistory.value = res.data.retrievedData
			})
		}
		catch (err) {
			console.log('Error retrieving history data: ', err)
		}
	}

	const getUserData = async () => {
		try {
			await auth.fetch().then(res => {
				Object.assign(userPromise, res)
				userPromise = userPromise.data[0]

				systemUserFormData.id = userPromise.id
				systemUserFormData.name = userPromise.name
				systemUserFormData.email = userPromise.email
				systemUserFormData.username = userPromise.username
				systemUserFormData.department = userPromise.department
				systemUserFormData.role = userPromise.role

				userInformationLoading.value = false
 			})
		}
		catch (err) {
			console.log('Retrieving user data failed: ', err)
		}
	}

	const getRoles = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			await axios.get(`${apiEndPoint}/api/list_of_all_roles_and_permissions`).then((res) => {
				systemUserRoleOption.value = res.data.retrievedData
			})
		}
		catch (err) {
			ElMessage({
				message: `Cannot load roles: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			roleLoading.value = false
		}
	}

	onMounted(() => {
		getUserData()
		getHistorySessions()
		getRoles()
	})
</script>

<template>
	<el-dialog destroy-on-close :overflow="false" v-model="showLogoutAll" title="Logout All Sessions" width="400">
		<logout-form />
	</el-dialog>

	<el-row class="profile" v-loading="userInformationLoading" element-loading-text="Loading..." >
		<el-col :span="24" class="profile-card">
			<el-row>
				<el-col :span="8" class="profile-card-area">
					<el-text size="large" class="profile-card-title"> User Information </el-text>
					<br />
					<el-text size="small"> Update your account's profile information. </el-text>
				</el-col>
				<el-col :span="12">
					<el-card shadow="never">
						<el-form label-width="auto" :label-position="labelPosition">
							<el-form-item label="Name">
								<el-input v-model="systemUserFormData.name" />
							</el-form-item>
							<el-form-item label="Email">
								<el-input v-model="systemUserFormData.email"/>
							</el-form-item>
							<el-form-item label="Username">
								<el-input v-model="systemUserFormData.username"/>
							</el-form-item>
							<!-- <el-form-item label="Department">
								<el-select v-model="systemUserFormData.department" placeholder="Select" filterable>
						      		<el-option v-for="option in listOfDepartments" :key="option.value.id" :label="option.label" :value="option.value" />
						      	</el-select>
							</el-form-item>	
							<el-form-item label="Role">
						      	<el-select v-model="systemUserFormData.role" placeholder="Select" :loading="roleLoading" filterable>
						      		<el-option v-for="option in systemUserRoleOption" :key="option.role" :label="option.role" :value="option.role" />
						      	</el-select>
						    </el-form-item> -->
						    <!-- <el-button v-else size="large" class="submit-width" type="success" @click="sendPrForm('submit')" :disabled="sendPrButtonIsDisabled"> Send </el-button>  -->
						    <el-button size="large" class="submit-width" type="success" @click="updateUserInfo" :disabled="updateUserButtonIsDisabled"> Save </el-button> 
						</el-form>
					</el-card>
				</el-col>
			</el-row>
		</el-col>

		<el-col :span="24" class="profile-card">
			<el-row>
				<el-col :span="8" class="profile-card-area">
					<el-text size="large" class="profile-card-title"> Change Password </el-text>
					<br />
					<el-text size="small"> Ensure your account is using long, random password to stay secure. </el-text>
				</el-col>
				<el-col :span="12">
					<el-card shadow="never">
						<el-form label-width="auto" :label-position="labelPosition">
							<el-form-item label="Old Password">
								<el-input type="password" v-model="systemUserFormData.old_password"/>
							</el-form-item>
							<el-form-item label="New Password">
								<el-input type="password" v-model="systemUserFormData.new_password"/>
							</el-form-item>
							<el-form-item label="Re-type New Password">
								<el-input type="password" v-model="systemUserFormData.retype_password"/>
							</el-form-item>
							<el-button size="large" class="submit-width" type="success" @click="updatePassword" :disabled="updatePasswordButtonIsDisabled"> Save </el-button> 
						</el-form>
					</el-card>
				</el-col>
			</el-row>
		</el-col>

		<el-col :span="24" class="profile-card">
			<el-row>
				<el-col :span="8" class="profile-card-area">
					<el-text size="large" class="profile-card-title"> Browser Sessions </el-text>
					<br />
					<el-text size="small"> Manage and monitor your logged in sessions. </el-text>
				</el-col>
				<el-col :span="12">
					<el-card shadow="never">
						<el-form>
							<div v-for="session in sessionHistory">
								<el-row class="session-area">
									<div>
										<i :class="getBrowserIcon(getBrowserInfo(session.device_name).browser).iconClass" :style="{ color: getBrowserIcon(getBrowserInfo(session.device_name).browser).color }"></i>
									</div>
									<div>
										<el-text size="large">
								          <strong>Browser:</strong> {{ getBrowserInfo(session.device_name).browser }} (v{{ getBrowserInfo(session.device_name).version }}) 
								        </el-text>
								        <br />
										<el-text> {{ session.ip_address }} @ {{ getOSFromUserAgent(session.device_name) }} </el-text>
										<br />
									</div>
								</el-row>
							</div>
							<el-button size="large" class="submit-width" type="danger" @click="showLogoutAll = true"> Logout all sessions </el-button> 
						</el-form>
					</el-card>
				</el-col>
			</el-row>
		</el-col>
	</el-row>
</template>

<style scoped>
	.submit-width {
		display: block;
		float: right;
		width: auto;
	}

	.profile {
		margin-top: 20px;
	}

	.profile-card-area {
		padding-top: 10px;
	}

	.profile-card {
		margin-bottom: 20px;
	}

	.profile-card-title {
		font-weight: 400;
		font-size: 20px;
	}

	.session-area {
		align-content: center; 
		align-items: center;
		margin-bottom: 20px;
	}

	.session-area i {
		font-size: 30px;
		margin-right: 20px;
	}

	.el-form {
		padding-bottom: 40px;
	}
</style>