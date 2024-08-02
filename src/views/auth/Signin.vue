<script lang='ts' setup>
	import { reactive, ref } from 'vue'
	import type { FormProps } from 'element-plus'
	import { ElMessage } from 'element-plus'
	import { useAuth } from 'vue-auth3'
	import { Picture as IconPicture } from '@element-plus/icons-vue'
	import { apiEndPoint } from '@/constant/data'
	import sorCityLogo from '/images/sorsogoncity.png'

	const labelPosition = ref<FormProps['labelPosition']>('top')

	const form = reactive({
	  username: '',
	  password: ''
	})

	const signInButtonIsDisabled = ref(false)

	const auth = useAuth()

	const signinSubmit = async () => {
	  if (signInButtonIsDisabled.value) 
	  	return;
	  
	  try {
	  	signInButtonIsDisabled.value = true
	  	await auth.login({
	  		data: {
	  			username: form.username,
	  			password: form.password
	  		},
	  	})
	  	.then((res) => {
	  		ElMessage({
				message: `Welcome, ${res.data.user.name}!`,
				type: 'success',
			})
	  	})
	  }
	  catch (err) {
	  	console.error('Login failed: ', err)
	  }
	  finally {
	  	signInButtonIsDisabled.value = false
	  }
	}
</script>

<template>
	<el-container>
		<el-main>
			<el-row>
				<el-col :span="9"> </el-col>
				<el-col :span="7">
					<el-form class="form" @keyup.enter="signinSubmit">
						<div class="logo-container">
							<div class="block">
								<center>
									<el-image style="width: 100px; height: 100px;" :src="sorCityLogo">
										<template #error>
											<div class="image-slot">
												<el-icon><icon-picture /></el-icon>
											</div>
										</template>
									</el-image>
								</center>
							</div>
						</div>
						<el-text class="title"> HFILE Depot </el-text> 
						<el-text class="subtitle"> Sign in with your account to use HFILE Depot Web App </el-text> 

						<el-text> Username </el-text>
			     		<el-input type="text" v-model="form.username" tabindex="1" autofocus/>

			     		<el-text> Password </el-text>
			     		<el-input type="password" show-password v-model="form.password" tabindex="2" />
			    		<el-link :underline="false" href="#" type="primary">Forgot password?</el-link>
			    		
			    		<el-button size="large" class="full-width" type="success" @click="signinSubmit" :disabled="signInButtonIsDisabled" tabindex="3 "> Sign In </el-button> 
						<el-divider />
					</el-form>
				</el-col>
				<el-col :span="8"> </el-col>
			</el-row>
		</el-main>
		<!-- <el-footer>
			COPYRIGHT © 2024 HFILE Depot, All rights Reserved
		</el-footer> -->
	</el-container>
</template>

<style scoped>
	.logo-container__error .block {
		padding: 30px 0;
		text-align: center;
		border-right: solid 1px var(--el-border-color);
		display: inline-block;
		width: 49%;
		box-sizing: border-box;
		vertical-align: top;
	}
	.logo-container__error .demonstration {
		display: block;
		color: var(--el-text-color-secondary);
		font-size: 14px;
		margin-bottom: 20px;
	}
	.logo-container__error .el-image {
		padding: 0 5px;
		max-width: 100px;
		max-height: 100px;
		width: 100px;
		height: 100px;
	}

	.logo-container__error .image-slot {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		color: var(--el-text-color-secondary);
		font-size: 30px;
	}
	.logo-container__error .image-slot .el-icon {
		font-size: 30px;
	}

	.full-width {
		display: block;
		width: 100%;
	}


	.el-link {
		display: flex;
		float: right;
		margin: -15px 0 20px 0;
	}

	.el-link:hover{
		background-color: rgba(0, 0, 0, 0);
	}

	.el-link .el-icon--right.el-icon {
		vertical-align: text-bottom;
	}

	.el-input {
		margin-bottom: 20px;
	}

	.title {
		font-size: 30px;
		width: 100%;
		display: block;
		text-align: center;
		font-weight: 500;
	}

	.subtitle {
		font-size: 13px;
		width: 100%;
		display: block;
		text-align: center;
		font-style: italic;
		margin-bottom: 20px;
	}

	.form {
		margin: 120px 40px 0 40px ;
		padding: 30px 10px 20px 10px;
		border: 1px solid var(--el-border-color);
		border-radius: 6px;
	}
</style>