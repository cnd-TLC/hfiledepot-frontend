<script lang='ts' setup>
	import { ref, reactive, onMounted } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { useRouter } from 'vue-router'
	import { Picture as IconPicture } from '@element-plus/icons-vue'
	import { Eleme, Promotion, Operation, UserFilled, TakeawayBox } from '@element-plus/icons-vue'
	import sorCityLogo from '/images/sorsogoncity.png'

	const router = useRouter()
	const auth = useAuth()
	
	const activeIndex = ref(router.currentRoute.value.name)

	let loading = ref(true)
	let userPromise = reactive({})
	let user = reactive({
		id: '',
		name: '',
		role: '',
		department: '',
		status: '',
		email: '',
		permissions: []
	})

	const checkPermission = (val: String) => {
		return user.permissions.includes(val)
	}

	const logoutSubmit = async () => {
	  try {
	  	await auth.logout()
	  }
	  catch (err) {
	  	console.error('Logout failed: ', err)
	  }
	}

	const getUserData = async () => {
		try {
			await auth.fetch().then(res => {
				Object.assign(userPromise, res)
				userPromise = userPromise.data[0]

				user.id = userPromise.id
				user.name = userPromise.name
				user.role = userPromise.role
				user.status = userPromise.status
				user.email = userPromise.email
				user.department = userPromise.department
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

	onMounted(() => {
		getUserData()
	})
</script>

<template>
	<el-container 
		v-loading="loading" 
		element-loading-text="Loading..." 
	>
		<el-aside width="250px">
			<div class="image-container">
				<div class="block">
					<center>
						<el-image style="width: 120px; height: 120px;" :src="sorCityLogo">
							<template #error>
								<div class="image-slot">
									<el-icon><icon-picture /></el-icon>
								</div>
							</template>
						</el-image>
					</center>
				</div>
			</div>
			<el-menu 
				:default-active = "activeIndex"
				style="height: 79vh"
				:router="true"
				active-text-color="#67c23a"
			>
				<el-menu-item index="/dashboard" v-if="checkPermission('purchaseOrdersHasView') || checkPermission('totalSpendOnProcurementHasView')">
					<el-icon> <eleme /> </el-icon>
					Dashboard
				</el-menu-item>
				<el-menu-item-group v-if="checkPermission('purchaseRequestHasView') || checkPermission('purchaseRequestApprovalHasView') || checkPermission('managePpmpHasView') || checkPermission('ppmpApprovalHasView') || checkPermission('ppmpItemsCatalogHasView')">
					<template #title> Manage </template>
					<el-sub-menu index="procurement">
						<template #title> 
							<el-icon> <promotion /> </el-icon>
							Procurement 
						</template>
						<el-menu-item v-if="checkPermission('purchaseRequestHasView')" index="/purchase_request"> Purchase Request </el-menu-item>
						<el-menu-item v-if="checkPermission('purchaseRequestApprovalHasView')" index="/manage_purchase_request"> Purchase Request Approval </el-menu-item>
						<el-menu-item v-if="checkPermission('managePpmpHasView')" index="/manage_ppmp"> Manage PPMP </el-menu-item>
						<el-menu-item v-if="checkPermission('ppmpApprovalHasView')" index="/manage_ppmp_approval"> PPMP Approval </el-menu-item>
						<el-menu-item v-if="checkPermission('ppmpItemsCatalogHasView')" index="/ppmp_items_catalog"> PPMP Items Catalog </el-menu-item>
					</el-sub-menu>
					<el-sub-menu index="inventory">
						<template #title> 
							<el-icon><takeaway-box /></el-icon>
							Inventory 
						</template>
						<el-menu-item index="procured_items"> Procured Items </el-menu-item>
						<el-menu-item index="manage_items"> Manage Items </el-menu-item>
						<el-menu-item index="items_for_inspection"> Items For Inspection </el-menu-item>
					</el-sub-menu>						
				</el-menu-item-group>
				<el-menu-item-group v-if="checkPermission('rolesAndPermissionsHasView') || checkPermission('systemUsersHasView')">
					<template #title> Accounts </template>
					<el-menu-item v-if="checkPermission('rolesAndPermissionsHasView')" index="/system_users" > 
						<el-icon> <user-filled /> </el-icon>
						System Users 
					</el-menu-item>
					<el-menu-item v-if="checkPermission('systemUsersHasView')" index="/roles_and_permissions"> 
						<el-icon> <operation /> </el-icon>
						Roles & Permissions 
					</el-menu-item>
				</el-menu-item-group>
			</el-menu>
		</el-aside>
		<el-container>
			<el-header>
				<el-menu 
					mode = "horizontal"
					:ellipsis = "false"
				>
					<div class="flex-grow" />
					<el-sub-menu index="profile">
						<template #title> {{ user.name }} </template>
						<el-menu-item index="view_profile"> View Profile </el-menu-item>
						<el-menu-item index="view_profile" @click="logoutSubmit"> Sign Out </el-menu-item>
					</el-sub-menu>
				</el-menu>
			</el-header>
				<el-main>
					<router-view />
				</el-main>
			<el-footer> 
				COPYRIGHT © 2024 HFILE Depot, All rights Reserved
			</el-footer>
		</el-container>
	</el-container>
	
</template>

<style scoped>
	.image-container {
		border-right: solid 1px var(--el-border-color);
	}

	.image-container__error .block {
		padding: 30px 0;
		text-align: center;
		border-right: solid 1px var(--el-border-color);
		display: inline-block;
		width: 49%;
		box-sizing: border-box;
		vertical-align: top;
	}
	.image-container__error .demonstration {
		display: block;
		color: var(--el-text-color-secondary);
		font-size: 14px;
		margin-bottom: 20px;
	}
	.image-container__error .el-image {
		padding: 0 5px;
		max-width: 120px;
		max-height: 120px;
		width: 120px;
		height: 120px;
	}

	.image-container__error .image-slot {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		background: var(--el-fill-color-light);
		color: var(--el-text-color-secondary);
		font-size: 30px;
	}
	.image-container__error .image-slot .el-icon {
		font-size: 30px;
	}

	.flex-grow {
		flex-grow: 1;
	}

	.el-header {
		padding: 0;
	}

	.el-main {
		background-color: rgba(250, 250, 250, 1);
	}

	.el-footer {
		text-align: center;
		padding: 20px 0 0 0;
	}

	.el-image {
		margin-top: 20px;
		
	}
</style>