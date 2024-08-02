<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import type { FormProps, UploadUserFile } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'
	import { useRouter } from 'vue-router'

	const router = useRouter().currentRoute.value

	const labelPosition = ref<FormProps['labelPosition']>('right')
	const emit = defineEmits(['addButtonIsClicked'])

	const prItemOptions = ref([])

	const prItemLoading = ref(true)

	const prItemFormData = reactive({
		pr_id: router.params.id,
		item_no: '',
		unit: '',
		category: '',
		item_description: '',
		unit_cost: 0,
		lumpsum: '',
		mode_of_procurement: '',
		remarks: '',
		quantity: 1,
		max_cost: 1,
		max_quantity: 1
	})

	const sendPrItemButtonIsDisabled = ref(false)

	const getItems = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			await axios.get(`${apiEndPoint}/api/list_of_department_ppmp_items`).then((res) => {
				prItemOptions.value = res.data.retrievedData
			})
		}
		catch (err) {
			console.log('Cannot load roles: ', err)
		}
		finally {
			prItemLoading.value = false
		}
	}

	const selectItem = (item: Array) => {
		prItemFormData.general_desc = item.general_desc
		prItemFormData.item_no = item.code
		prItemFormData.unit = item.unit
		prItemFormData.category = item.category
		prItemFormData.item_description = item.general_desc
		prItemFormData.quantity = item.lumpsum ? 1 : item.quantity
		prItemFormData.lumpsum = item.lumpsum ? true : false
		prItemFormData.mode_of_procurement = item.mode_of_procurement
		prItemFormData.unit_cost = item.estimated_budget
		prItemFormData.max_cost = item.estimated_budget
		prItemFormData.max_quantity = item.quantity
	}
	const sendPrItemForm = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try{
			sendPrItemButtonIsDisabled.value = true
			await axios.post(`${apiEndPoint}/api/add_pr_items`, {
					pr_id: prItemFormData.pr_id,
					item_no: prItemFormData.item_no,
					unit: prItemFormData.unit,
					category: prItemFormData.category,
					item_description: prItemFormData.item_description,
					quantity: prItemFormData.quantity,
					unit_cost: prItemFormData.unit_cost,
					lumpsum: prItemFormData.lumpsum,
					mode_of_procurement: prItemFormData.mode_of_procurement,
					remarks: prItemFormData.remarks,
					quantity: prItemFormData.quantity,
				}).then((res) => {
					console.log(res.data.message)
				})
			emit('addButtonIsClicked')
		}
		catch (err) {
			console.log('Cannot submit form: ', err)
		}
		finally {
			sendPrItemButtonIsDisabled.value = false
		}
	}

	onMounted(() => {
		if(false)
			console.log('For Update')
		else
			getItems()
	})
</script>

<template>
 	<el-form :model="prItemFormData" label-width="auto" :label-position="labelPosition">
	    <el-form-item label="Select Item">
	      	<el-select v-model="prItemFormData.item_description" placeholder="Select" :loading="prItemLoading" filterable>
	      		<el-option v-for="item in prItemOptions" 
	      			:key="item.id" 
	      			:label="item.general_desc" 
	      			:value="item.general_desc" 
	      			@click="selectItem(item)"
	      			/>
	      	</el-select>
	    </el-form-item>
	    <el-form-item label="Quantity">
	      	<el-input v-if="prItemFormData.lumpsum" value="Lumpsum" readonly />
	      	<el-input-number v-else class="full-width" v-model="prItemFormData.quantity" :max="prItemFormData.max_quantity" :min="1" />
	    </el-form-item>
	    <el-form-item label="Unit Cost (₱)">
	      	<el-input type="number" v-model="prItemFormData.unit_cost" :max="prItemFormData.max_cost" :min="1"/>
	    </el-form-item>
	    <el-button size="large" class="submit-width" type="success" @click="sendPrItemForm" :disabled="sendPrItemButtonIsDisabled"> Send </el-button> 
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

	.el-form {
		padding-bottom: 40px;
	}
</style>