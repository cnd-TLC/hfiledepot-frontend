<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import type { FormProps, FormInstance, FormRules } from 'element-plus'
	import { apiEndPoint, validations } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'
	
	const labelPosition = ref<FormProps['labelPosition']>('top')
	const emit = defineEmits(['manageButtonIsClicked'])
	const ruleRoleFormRef = ref<FormInstance>()

	interface RuleForm {
		role: string,
		description: string,
	}

	const rules = reactive<FormRules<RuleForm>>(validations)

	const rolesAndPermissionsData = reactive<RuleForm>({
		role: '',
		description: '',
		role_modules: []
	})

	const props = defineProps({
		update: Boolean,
		data: Object
	})

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

	const ppmpGeneralDescLoading = ref(true)
	const modeOfProcurementLoading = ref(false)
	const activeCollapse = ref('Dashboard')
	const modules = {
			dashboard: {
				request_cards: [
					'dashboardHasRequestCards'
				],
				approval_chart: [
					'dashboardHasApprovalChart'
				],
				office_request_chart: [
					'dashboardHasOfficeRequestChart'
				],
			},
			procurement: {
				purchase_request: [
					'purchaseRequestHasView',
					'purchaseRequestHasSend',
					'purchaseRequestHasUpdate',
					'purchaseRequestHasRemove',
					'purchaseRequestHasRequestItems',
					'purchaseRequestHasManageAttachments'
				],
				purchase_request_approval: [
					'purchaseRequestApprovalHasView',
					'purchaseRequestApprovalHasUpdateDetails',
					'purchaseRequestApprovalHasManageAttachments',
					'purchaseRequestApprovalHasPending',
					'purchaseRequestApprovalHasGeneralApprove',
					'purchaseRequestApprovalHasReject',
				],
				manage_ppmp: [
					'managePpmpHasView',
					'managePpmpHasAdd',
					'managePpmpHasUpdate',
					'managePpmpHasRemove',
					'managePpmpHasManageItems',
					'managePpmpHasManageAttachments'
				],
				ppmp_approval: [
					'ppmpApprovalHasView',
					'ppmpApprovalHasManageAttachments',
					'ppmpApprovalHasPending',
					'ppmpApprovalHasApprove',
					'ppmpApprovalHasReject',
				],
				ppmp_items_master_list: [
					'ppmpItemsMasterListHasView',
					// 'ppmpItemsCatalogHasAdd',
					// 'ppmpItemsCatalogHasUpdate',
					// 'ppmpItemsCatalogHasRemove'
				],
			},
			accounts: {
				system_users: [
					'systemUsersHasView',
					'systemUsersHasAdd',
					'systemUsersHasUpdate',
					'systemUsersHasRemove'
				],
				roles_and_permissions : [
					'rolesAndPermissionsHasView',
					'rolesAndPermissionsHasAdd',
					'rolesAndPermissionsHasUpdate',
					'rolesAndPermissionsHasRemove'
				]
			}
		}

	const manageRolesAndPermissionButtonIsDisabled = ref(false)

	const manageRolesAndPermissionsForm = async (formType: String, elForm: FormInstance | undefined) => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		if (!elForm)
			return
		manageRolesAndPermissionButtonIsDisabled.value = true
		await elForm.validate((valid, fields) => {
			if(valid) {
				try{
					if (formType === 'submit'){
						axios.post(`${apiEndPoint}/api/add_roles_and_permissions`, { 
							role: rolesAndPermissionsData.role,
							description: rolesAndPermissionsData.description,
							role_modules: JSON.stringify(rolesAndPermissionsData.role_modules),
						}).then((res) => {
							ElMessage({
								message: res.data.message,
								type: 'success',
							})
							manageRolesAndPermissionButtonIsDisabled.value = false
						})
					}
					else{
						axios.put(`${apiEndPoint}/api/update_roles_and_permissions/${props.data.id}`, {
							role: rolesAndPermissionsData.role,
							description: rolesAndPermissionsData.description,
							role_modules: rolesAndPermissionsData.role_modules,
						}).then((res) => {
							ElMessage({
								message: res.data.message,
								type: 'success',
							})
							manageRolesAndPermissionButtonIsDisabled.value = false
						})
					}
					emit('manageButtonIsClicked')
				}
				catch (err) {
					ElMessage({
						message: `Cannot submit form: ${err.message}`,
						type: 'error',
					})
					manageRolesAndPermissionButtonIsDisabled.value = false
				}
			}
			else
				manageRolesAndPermissionButtonIsDisabled.value = false
		})
	}

	onMounted(() => {
		if (props.update){
			rolesAndPermissionsData.role = props.data.role
			rolesAndPermissionsData.description = props.data.description
			let roles = JSON.parse(props.data.role_modules)
			if (roles)
				rolesAndPermissionsData.role_modules = roles
		}
	})
</script>

<template>
 	<el-form ref="ruleRoleFormRef" :model="rolesAndPermissionsData"  :rules="rules" label-width="auto" :label-position="labelPosition">
 		<el-form-item>
 			<el-col :span="4" class="input-area">
		 		<el-form-item label="Role Name" prop="role">
		 			<el-input v-model="rolesAndPermissionsData.role" />
				</el-form-item>
		    </el-col>
 			<el-col :span="16">
		 		<el-form-item label="Description" prop="description">
		 			<el-input v-model="rolesAndPermissionsData.description" />
				</el-form-item>
			</el-col>
		</el-form-item>
		<el-divider>
			<el-text class="schedule-title">
    			Module Permissions
    		</el-text> 
		</el-divider>
	    <el-form-item>
    		<template #label>
				<el-text class="module-title">
					Dashboard
				</el-text>
			</template>
	    	<el-col :span="24" class="input-area">
	    		<el-row>
	    			<el-col :span="4" class="input-area">
	    				<el-card class="custom-card" shadow="never">
	    					<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>
								<el-text class="sub-module-title" type="danger">
			    					Request Cards
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.dashboard.request_cards[0]"> View </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    			<el-col :span="4" class="input-area">
	    				<el-card class="custom-card" shadow="never">
	    					<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>
								<el-text class="sub-module-title" type="danger">
			    					Approval Chart
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.dashboard.approval_chart[0]"> View </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    			<el-col :span="4" class="input-area">
	    				<el-card class="custom-card" shadow="never">
	    					<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>
								<el-text class="sub-module-title" type="danger">
			    					Office Requests Chart
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.dashboard.office_request_chart[0]"> View </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    		</el-row>
	    	</el-col>
	    </el-form-item>
	    <el-form-item>
	    	<template #label>
				<el-text class="module-title">
					Procurement
				</el-text>
			</template>
    		<el-col :span="24">
	    		<el-row>
	    			<el-col :span="4" class="input-area">
	    				<el-card class="custom-card" shadow="never">
	    					<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>
								<el-text class="sub-module-title" type="danger">
			    					Purchase Request
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.procurement.purchase_request[0]"> View </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request[1]"> Add </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request[2]"> Update </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request[3]"> Remove </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request[4]"> Request Items </el-checkbox>
								<el-checkbox :value="modules.procurement.purchase_request[5]"> Manage Attachments </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    			<el-col :span="4" class="input-area">
	    				<el-card class="custom-card" shadow="never">
	    					<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>
								<el-text class="sub-module-title" type="danger">
			    					PR Approval
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.procurement.purchase_request_approval[0]"> View </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request_approval[1]"> Update Details </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request_approval[2]"> Manage Attachments </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request_approval[3]"> Set Pending </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request_approval[4]"> Set Approve </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request_approval[5]"> Set Reject </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    		</el-row>
	    	</el-col>
	    </el-form-item>
    	<el-form-item>
			<template #label>
				<el-text class="module-title">
					Procurement Project Management Plans / Annual Procurement Plans
				</el-text>
			</template>
    		<el-col :span="24">
	    		<el-row>
	    			<el-col :span="4" class="input-area">
	    				<el-card class="custom-card" shadow="never">
	    					<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>

								<el-text class="sub-module-title" type="danger">
			    					PPMP / APP
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.procurement.manage_ppmp[0]"> View </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.manage_ppmp[1]"> Add </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.manage_ppmp[2]"> Update </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.manage_ppmp[3]"> Remove </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.manage_ppmp[4]"> Manage Items </el-checkbox>
								<el-checkbox :value="modules.procurement.manage_ppmp[5]"> Manage Attachments </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    			<el-col :span="4" class="input-area">
	    				<el-card class="custom-card" shadow="never">
	    					<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>
								<el-text class="sub-module-title" type="danger">
			    					PPMP Approval
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.procurement.ppmp_approval[0]"> View </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.ppmp_approval[1]"> Manage Attachments </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.ppmp_approval[2]"> Set Pending </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.ppmp_approval[3]"> Set Approve </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.ppmp_approval[4]"> Set Reject </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    			<el-col :span="4">
	    				<el-card class="custom-card" shadow="never">
	    					<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>
								<el-text class="sub-module-title" type="danger">
			    					Items Master List
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.procurement.ppmp_items_master_list[0]"> View </el-checkbox>
								<!-- <br /> -->
								<!-- <el-checkbox :value="modules.procurement.ppmp_items_master_list[1]"> Add </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.ppmp_items_master_list[2]"> Update </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.ppmp_items_master_list[3]"> Remove </el-checkbox> -->
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    		</el-row>
	    	</el-col>
	    </el-form-item>
	    <el-form-item>
	    	<template #label>
				<el-text class="module-title">
					Accounts
				</el-text>
			</template>
    		<el-col :span="24">
	    		<el-row>
	    			<el-col :span="4" class="input-area">
	    				<el-card class="custom-card" shadow="never">
							<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>
								<el-text class="sub-module-title" type="danger">
			    					System Users
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.accounts.system_users[0]"> View </el-checkbox>
								<br />
								<el-checkbox :value="modules.accounts.system_users[1]"> Add </el-checkbox>
								<br />
								<el-checkbox :value="modules.accounts.system_users[2]"> Update </el-checkbox>
								<br />
								<el-checkbox :value="modules.accounts.system_users[3]"> Remove </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    			<el-col :span="4" class="input-area">
	    				<el-card class="custom-card" shadow="never">
							<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>
								<el-text class="sub-module-title" type="danger">
			    					Roles & Permissions
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.accounts.roles_and_permissions[0]"> View </el-checkbox>
								<br />
								<el-checkbox :value="modules.accounts.roles_and_permissions[1]"> Add </el-checkbox>
								<br />
								<el-checkbox :value="modules.accounts.roles_and_permissions[2]"> Update </el-checkbox>
								<br />
								<el-checkbox :value="modules.accounts.roles_and_permissions[3]"> Remove </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    		</el-row>
	    	</el-col>
	    </el-form-item>
	    <el-button v-if="props.update" size="large" class="submit-width" type="warning" @click="manageRolesAndPermissionsForm('update', ruleRoleFormRef)" :disabled="manageRolesAndPermissionButtonIsDisabled"> Update </el-button> 

	    <el-button v-else size="large" class="submit-width" type="success" @click="manageRolesAndPermissionsForm('submit', ruleRoleFormRef)" :disabled="manageRolesAndPermissionButtonIsDisabled"> Add </el-button> 
  	</el-form>
</template>

<style scoped>
	.submit-width {
		display: block;
		float: right;
		width: 10%;
	}

	.custom-card {
		margin-bottom: 10px;
	}

	.schedule-title {
		font-size: 16px;
		font-weight: 500;
	}

	.module-title {
		font-size: 14px;
		font-weight: 600;
	}

	.sub-module-title {
		font-size: 14px;
		font-weight: 500;
	}

	.input-area {
		padding: 0 10px 0 0;
	}

	.el-form {
		padding-bottom: 40px;
	}

	.el-divider {
		margin: 24px 0 10px 0;
	}

	.el-collapse, .el-collapse-item__header {
		width: 100%;
		border: none !important;
	}
</style>