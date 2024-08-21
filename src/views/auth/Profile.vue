<script lang='ts' setup>
	import { ref, reactive, onMounted } from 'vue'
	import { useAuth } from 'vue-auth3'
	import type { FormProps, FormInstance, FormRules } from 'element-plus'
	import { ElMessage } from 'element-plus'
	import { apiEndPoint, listOfDepartments, validations } from '@/constant/data'
	import axios from 'axios'
	import LogoutForm from '@/views/auth/LogoutForm.vue'

	const emit = defineEmits(['updateUserInfo'])
	const labelPosition = ref<FormProps['labelPosition']>('top')
	const ruleUserFormRef = ref<FormInstance>()
	const rulePasswordFormRef = ref<FormInstance>()

	interface RuleForm {
		id: string,
		name: string,
		email: string,
		username: string,
		department: string,
		role: string,
		status: string,
		old_password: string,
		new_password: string,
		retype_password: string,
	}

	const rules = reactive<FormRules<RuleForm>>(validations)

	const systemUserFormData = reactive<RuleForm>({
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

	const auth = useAuth()
	const sessionHistory = ref([])
	const systemUserRoleOption = ref([])
	const showLogoutAll = ref(false)
	const roleLoading = ref(true)
	const userInformationLoading = ref(true)
	const updateUserButtonIsDisabled = ref(false)
	const updatePasswordButtonIsDisabled = ref(false)

	let userPromise = reactive({})

	const setAuthHeader = () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
	}

	const updateUserInfo = async (elForm: FormInstance | undefined) => {
		setAuthHeader()
		if (!elForm) 
			return
		updateUserButtonIsDisabled.value = true
		await elForm.validate((valid, fields) => {
			if (valid){
				try{
					axios.put(`${apiEndPoint}/api/update_users/${systemUserFormData.id}`, {
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
						updateUserButtonIsDisabled.value = false
					})
				}
				catch (err) {
					ElMessage({
						message: `Cannot submit form: ${err.message}`,
						type: 'error',
					})
					updateUserButtonIsDisabled.value = false
				}
				finally {
					emit('updateUserInfo')
				}
			}
			else
				updateUserButtonIsDisabled.value = false
		})
	}

	const updatePassword = async (elForm: FormInstance | undefined) => {
		setAuthHeader()
		if (!elForm) 
			return
		updatePasswordButtonIsDisabled.value = true
		await elForm.validate((valid, fields) => {
			if (valid) {
				try{
					axios.put(`${apiEndPoint}/api/update_password`, {
						old_password: systemUserFormData.old_password,
						new_password: systemUserFormData.new_password,
						retype_password: systemUserFormData.retype_password,
					}).then((res) => {
						ElMessage({
							message: res.data.message,
							type: res.data.status == 'success' ? 'success' : 'error',
						})
						if(res.data.status == 'success'){
							systemUserFormData.old_password = ''
							systemUserFormData.new_password = ''
							systemUserFormData.retype_password = ''
						}
						updatePasswordButtonIsDisabled.value = false
					})
				}
				catch (err) {
					ElMessage({
						message: `Cannot submit form: ${err.message}`,
						type: 'error',
					})
					updatePasswordButtonIsDisabled.value = false
				}
				finally {
					emit('updateUserInfo')
				}
			}
			else
				updatePasswordButtonIsDisabled.value = false
		})
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
						<el-form ref="ruleUserFormRef" :model="systemUserFormData" :rules="rules" label-width="auto" :label-position="labelPosition">
							<el-form-item label="Name" prop="name">
								<el-input v-model="systemUserFormData.name" />
							</el-form-item>
							<el-form-item label="Email" prop="email">
								<el-input v-model="systemUserFormData.email"/>
							</el-form-item>
							<el-form-item label="Username" prop="username">
								<el-input v-model="systemUserFormData.username"/>
							</el-form-item>
							<el-button size="large" class="submit-width" type="success" @click="updateUserInfo(ruleUserFormRef)" :disabled="updateUserButtonIsDisabled"> Save </el-button>
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
						<el-form ref="rulePasswordFormRef" :model="systemUserFormData" :rules="rules" :size="formSize" label-width="auto" :label-position="labelPosition">
							<el-form-item label="Old Password" prop="old_password">
								<el-input type="password" show-password v-model="systemUserFormData.old_password"/>
							</el-form-item>
							<el-form-item label="New Password" prop="new_password">
								<el-input type="password" show-password v-model="systemUserFormData.new_password"/>
							</el-form-item>
							<el-form-item label="Re-type New Password" prop="retype_password">
								<el-input type="password" show-password v-model="systemUserFormData.retype_password"/>
							</el-form-item>
							<el-button size="large" class="submit-width" type="success" @click="updatePassword(rulePasswordFormRef)" :disabled="updatePasswordButtonIsDisabled"> Save </el-button> 
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