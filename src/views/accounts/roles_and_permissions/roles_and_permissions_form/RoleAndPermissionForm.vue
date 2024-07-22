<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import type { FormProps } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'
	
	const labelPosition = ref<FormProps['labelPosition']>('top')
	const emit = defineEmits(['manageButtonIsClicked'])

	const props = defineProps({
		update: Boolean,
		data: Object
	})

	const ppmpGeneralDescLoading = ref(true)
	const modeOfProcurementLoading = ref(false)
	const activeCollapse = ref('Dashboard')
	const modules = {
			dashboard: {
				purchased_orders: [
					'purchaseOrdersHasView'
				],
				total_spend_on_procurement: [
					'totalSpendOnProcurementHasView'
				]
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
					'purchaseRequestApprovalHasGeneralApprove',
					'purchaseRequestApprovalHasBacApprove',
					'purchaseRequestApprovalHasUpdate',
					'purchaseRequestApprovalHasReject',
					'purchaseRequestApprovalHasManageAttachments'
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
					'ppmpApprovalHasApprove',
					'ppmpApprovalHasReject',
					'ppmpApprovalHasManageAttachments'
				],
				ppmp_items_catalog: [
					'ppmpItemsCatalogHasView',
					'ppmpItemsCatalogHasAdd',
					'ppmpItemsCatalogHasUpdate',
					'ppmpItemsCatalogHasRemove'
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

	const rolesAndPermissionsData = reactive({
		role: '',
		description: '',
		role_modules: []
	})

	const manageRolesAndPermissionButtonIsDisabled = ref(false)

	const manageRolesAndPermissionsForm = async (formType: String) => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			if (formType === 'submit'){
				await axios.post(apiEndPoint + '/api/add_roles_and_permissions', { 
					role: rolesAndPermissionsData.role,
					description: rolesAndPermissionsData.description,
					role_modules: JSON.stringify(rolesAndPermissionsData.role_modules),
				}).then((res) => {
					console.log(res.data.message)
				})
			}
			else{
				await axios.put(apiEndPoint + '/api/update_roles_and_permissions/' + props.data.id, {
					role: rolesAndPermissionsData.role,
					description: rolesAndPermissionsData.description,
					role_modules: rolesAndPermissionsData.role_modules,
				}).then((res) => {
					console.log(res.data.message)
				})
			}
			manageRolesAndPermissionButtonIsDisabled.value = true
			emit('manageButtonIsClicked')
		}
		catch (err) {
			console.log('Cannot submit form: ', err)
		}
		finally {
			manageRolesAndPermissionButtonIsDisabled.value = false
		}
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
 	<el-form :model="rolesAndPermissionsData" label-width="auto" :label-position="labelPosition">
 		<el-form-item>
 			<el-col :span="4" class="input-area">
		 		<el-form-item label="Role Name">
		 			<el-input v-model="rolesAndPermissionsData.role" />
				</el-form-item>
		    </el-col>
 			<el-col :span="16">
		 		<el-form-item label="Description">
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
			    					Purchased Orders
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.dashboard.purchased_orders[0]"> View </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    			<el-col :span="4" class="input-area">
	    				<el-card class="custom-card" shadow="never">
	    					<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>
								<el-text class="sub-module-title" type="danger">
			    					Another Module
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.dashboard.total_spend_on_procurement[0]"> View </el-checkbox>
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
								<el-checkbox :value="modules.procurement.purchase_request_approval[1]"> Approve </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request_approval[2]"> Approve (BAC) </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request_approval[3]"> Update (BAC) </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.purchase_request_approval[4]"> Reject </el-checkbox>
								<el-checkbox :value="modules.procurement.purchase_request_approval[5]"> Manage Attachments </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    			<el-col :span="4" class="input-area">
	    				<el-card class="custom-card" shadow="never">
	    					<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>

								<el-text class="sub-module-title" type="danger">
			    					Manage PPMP
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
								<el-checkbox :value="modules.procurement.ppmp_approval[1]"> Approve </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.ppmp_approval[2]"> Reject </el-checkbox>
								<el-checkbox :value="modules.procurement.ppmp_approval[3]"> Manage Attachments </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    			<el-col :span="4">
	    				<el-card class="custom-card" shadow="never">
	    					<el-checkbox-group
								v-model="rolesAndPermissionsData.role_modules"
							>
								<el-text class="sub-module-title" type="danger">
			    					PPMP Items Catalog
			    				</el-text>
			    				<br />
								<el-checkbox style="margin-top: 10px" :value="modules.procurement.ppmp_items_catalog[0]"> View </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.ppmp_items_catalog[1]"> Add </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.ppmp_items_catalog[2]"> Update </el-checkbox>
								<br />
								<el-checkbox :value="modules.procurement.ppmp_items_catalog[3]"> Remove </el-checkbox>
							</el-checkbox-group>
	    				</el-card>
	    			</el-col>
	    		</el-row>
	    	</el-col>
	    </el-form-item>
    	<el-form-item>
			<template #label>
				<el-text class="module-title">
					Inventory
				</el-text>
			</template>
    		<el-col :span="24">
	    		<el-row>
	    			<el-col :span="4" class="input-area">
	    				<el-card />
	    			</el-col>
	    			<el-col :span="4" class="input-area">
	    				<el-card />
	    			</el-col>
	    			<el-col :span="4">
    					<el-card />
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
	    <el-button v-if="props.update" size="large" class="submit-width" type="warning" @click="manageRolesAndPermissionsForm('update')" :disabled="manageRolesAndPermissionButtonIsDisabled"> Update </el-button> 

	    <el-button v-else size="large" class="submit-width" type="success" @click="manageRolesAndPermissionsForm('submit')" :disabled="manageRolesAndPermissionButtonIsDisabled"> Add </el-button> 
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