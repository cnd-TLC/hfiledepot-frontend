<script lang='ts' setup>
	import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
	import { useAuth } from 'vue-auth3'
	import { useRouter } from 'vue-router'
	import { Picture as IconPicture, Eleme, Promotion, Operation, UserFilled, DocumentCopy, ArrowRight, Moon, Sunny } from '@element-plus/icons-vue'
	import { useFullscreen, useDark, useToggle } from '@vueuse/core'
	import sorCityLogo from '/images/sorsogoncity.png'

	const el = ref<HTMLElement | null>(null)
	const { isFullscreen, enter, exit, toggle } = useFullscreen(el) || {}

	const router = useRouter()
	const auth = useAuth()
	const isDark = useDark({ disableTransition: false })
	const toggleDark = useToggle(isDark)
	const activeIndex = ref(router.currentRoute.value.name)
	const setFullscreen = isFullscreen.value ? ref(true) : ref(false)
	const darkMode = isDark.value ? ref(true) : ref(false)

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

	const handleFullscreenChange = () => {
		setFullscreen.value = isFullscreen.value;
	}

	const addFullscreenChangeListener = () => {
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
		document.addEventListener('mozfullscreenchange', handleFullscreenChange);
		document.addEventListener('msfullscreenchange', handleFullscreenChange);
	}

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

	watch(darkMode, (newValue) => {
		const containerElements = document.getElementsByClassName('el-container');
		if (containerElements.length > 0) {
			const container = containerElements[0];
			container.style.backgroundColor = newValue ? '#141414' : 'white'; 
		}
    });

	onMounted(() => {
		getUserData()

		const containerElements = document.getElementsByClassName('el-container');
		if (containerElements.length > 0) {
			const container = containerElements[0];
			container.style.backgroundColor = isDark.value ? '#141414' : 'white'; 
		}

		addFullscreenChangeListener()
	})

	onBeforeUnmount(() => {
		document.removeEventListener('fullscreenchange', handleFullscreenChange);
		document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
		document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
		document.removeEventListener('msfullscreenchange', handleFullscreenChange);
	})
</script>

<template>
	<el-container
		v-loading.fullscreen.lock="loading"
		element-loading-text="Loading..." 
		ref="el"	
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
				class="main-menu" 
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
					<el-sub-menu index="procurement" v-if="checkPermission('purchaseRequestHasView') || checkPermission('purchaseRequestApprovalHasView')">
						<template #title> 
							<el-icon> <promotion /> </el-icon>
							Procurement 
						</template>
						<el-menu-item style="padding-left: 20px" v-if="checkPermission('purchaseRequestHasView')" index="/purchase_request"> <el-icon style="font-size: 10px"><arrow-right /></el-icon> Purchase Request </el-menu-item>
						<el-menu-item style="padding-left: 20px" v-if="checkPermission('purchaseRequestApprovalHasView')" index="/manage_purchase_request"> <el-icon style="font-size: 10px"><arrow-right /></el-icon> Purchase Request Approval </el-menu-item>
					</el-sub-menu>
					<el-sub-menu index="ppmp" v-if="checkPermission('managePpmpHasView') || checkPermission('ppmpApprovalHasView') || checkPermission('ppmpItemsCatalogHasView')">
						<template #title> 
							<el-icon><document-copy /></el-icon>
							PPMP 
						</template>
						<el-menu-item style="padding-left: 20px" v-if="checkPermission('managePpmpHasView')" index="/manage_ppmp"> <el-icon style="font-size: 10px"><arrow-right /></el-icon> Manage PPMP </el-menu-item>
						<el-menu-item style="padding-left: 20px" v-if="checkPermission('ppmpApprovalHasView')" index="/manage_ppmp_approval"> <el-icon style="font-size: 10px"><arrow-right /></el-icon> PPMP Approval </el-menu-item>
						<el-menu-item style="padding-left: 20px" v-if="checkPermission('ppmpItemsCatalogHasView')" index="/ppmp_items_catalog"> <el-icon style="font-size: 10px"><arrow-right /></el-icon> PPMP Items Catalog </el-menu-item>
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
					style="align-items: center;"
					mode = "horizontal"
					:ellipsis = "false"
				>
					<div class="flex-grow" />
					<el-switch 
						@click="toggle" 
						v-model="setFullscreen" 
						active-text="Fullscreen On" 
						inactive-text="Fullscreen Off" 
						inline-prompt 
						style="--el-switch-on-color: #67c23a; --el-switch-off-color: #909399"
					/>
					<el-switch
						@click="toggleDark()"
						v-model="darkMode"
						class="mode-switch"
						style="margin-left: 10px; --el-switch-on-color: #409EFF; --el-switch-off-color: #E6A23C"
						inline-prompt
						:active-icon="Moon"
						:inactive-icon="Sunny"
					/>
					<el-sub-menu index="profile" v-if="!isFullscreen">
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

<style>
	.loading-screen {
		height: 100vh;
	}

	.image-container {
		padding-top: 20px;
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
		margin-top: 20px;
	}

	.image-container__error .image-slot {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
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

	.el-footer {
		font-style: italic;
		font-size: 10px;
		text-align: center;
		padding: 25px 0 0 0;
	}

	.main-menu {
		align-items: center;
	}

	.main-menu .el-menu-item {
		height: 45px !important;
	}

	.main-menu .el-sub-menu__title {
		height: 45px;
	}

	.el-menu .fullscreen {
		font-size: 12px;
		height: 100%;
	}

	.el-menu .fullscreen:hover {
		color: #409eff;
	}

	.mode-switch {
		margin-right: 10px;
	}
	
</style>