<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import type { FormProps } from 'element-plus'
	import { apiEndPoint, listOfDepartments } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const labelPosition = ref<FormProps['labelPosition']>('right')
	const emit = defineEmits(['manageButtonIsClicked'])

	const props = defineProps({
		update: Boolean,
		data: Object
	})

	const ppmpItemFormData = reactive({
		general_desc: '',
		unit: '',
		mode_of_procurement: '',
		year: new Date().getFullYear(),
		department: '',
	})

	const managePpmpItemButtonIsDisabled = ref(false)

	const managePpmpItemForm = async (formType: String) => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			managePpmpItemButtonIsDisabled.value = true
			if (formType === 'submit'){
				await axios.post(`${apiEndPoint}/api/add_ppmp_items_master_list`, { 
					general_desc: ppmpItemFormData.general_desc,
					unit: ppmpItemFormData.unit,
					mode_of_procurement: ppmpItemFormData.mode_of_procurement,
					year: ppmpItemFormData.year,
					department: ppmpItemFormData.department,
				}).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
				})
			}
			else{
				await axios.put(`${apiEndPoint}/api/update_ppmp_items_master_list/${props.data.id}`, {
					general_desc: ppmpItemFormData.general_desc,
					unit: ppmpItemFormData.unit,
					mode_of_procurement: ppmpItemFormData.mode_of_procurement,
					year: ppmpItemFormData.year,
					department: ppmpItemFormData.department,
				}).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
				})
			}
			emit('manageButtonIsClicked')
		}
		catch (err) {
			ElMessage({
				message: `Cannot submit form: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			managePpmpItemButtonIsDisabled.value = false
		}
	}

	onMounted(() => {
		if (props.update){
			ppmpItemFormData.general_desc = props.data.general_desc
			ppmpItemFormData.unit = props.data.unit
			// ppmpItemFormData.mode_of_procurement = props.data.mode_of_procurement
			ppmpItemFormData.year = props.data.year
			ppmpItemFormData.department = props.data.department
		}
	})
</script>

<template>
 	<el-form :model="ppmpItemFormData" label-width="auto" :label-position="labelPosition">
 		<el-form-item label="Select Department">
	      	<el-select v-model="ppmpItemFormData.department" placeholder="Select" filterable>
	      		<el-option v-for="option in listOfDepartments" :key="option.value.id" :label="option.label" :value="option.value" />
	      	</el-select>
	    </el-form-item>
	    <el-form-item label="General Description">
	      	<el-input type="textarea" v-model="ppmpItemFormData.general_desc" />
	    </el-form-item>
 		<el-form-item label="Year">
	      	<el-input type="number" v-model="ppmpItemFormData.year" :min="1900" />
		</el-form-item>
		<el-form-item label="Unit">
 			<el-input v-model="ppmpItemFormData.unit" />
		</el-form-item>
		<!-- <el-form-item label="Mode of Procurement">
			<el-select
				v-model="ppmpItemFormData.mode_of_procurement"
				placeholder="Select"
			>
				<el-option
					:label="'Bidding'"
					:value="'Bidding'"
				/>
				<el-option
					:label="'Shopping'"
					:value="'Shopping'"
				/>
			</el-select>
		</el-form-item> -->
	    <el-button v-if="props.update" size="large" class="submit-width" type="warning" @click="managePpmpItemForm('update')" :disabled="managePpmpItemButtonIsDisabled"> Update </el-button> 

	    <el-button v-else size="large" class="submit-width" type="success" @click="managePpmpItemForm('submit')" :disabled="managePpmpItemButtonIsDisabled"> Add </el-button> 
  	</el-form>
</template>

<style scoped>
	.submit-width {
		display: block;
		float: right;
		width: 30%;
	}

	.full-width {
		display: block;
		width: 100%;
	}

	.schedule-title {
		font-size: 16px;
		font-weight: 500;
	}

	.quarter-title {
		font-size: 14px;
		font-weight: 500;
	}

	.input-area {
		padding: 0 10px 0 0;
	}

	.form-item-top-padding {
		padding-top: 10px;
	}

	.el-form {
		padding-bottom: 40px;
	}
</style>