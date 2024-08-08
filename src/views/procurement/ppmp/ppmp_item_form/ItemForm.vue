<script lang="ts" setup>
	import { reactive, ref, onMounted, computed } from 'vue'
	import type { FormProps } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import { useRouter } from 'vue-router'
	import axios from 'axios'

	const router = useRouter().currentRoute.value

	const labelPosition = ref<FormProps['labelPosition']>('top')
	const emit = defineEmits(['manageButtonIsClicked'])

	const props = defineProps({
		update: Boolean,
		data: Object
	})

	const ppmpItemOptions = ref([])

	const ppmpGeneralDescLoading = ref(true)

	const ppmpItemFormData = reactive({
		ppmp_id: router.params.id,
		code: '',
		category: '',
		general_desc: '',
		unit: '',
		lumpsum: false,
		mode_of_procurement: '',
		estimated_budget: 0.00,
		jan: '',
		feb: '',
		mar: '',
		apr: '',
		may: '',
		jun: '',
		jul: '',
		aug: '',
		sept: '',
		oct: '',
		nov: '',
		dec: '',
	})

	const totalQuantity = computed (() => {
		return [
	        ppmpItemFormData.jan,
	        ppmpItemFormData.feb,
	        ppmpItemFormData.mar,
	        ppmpItemFormData.apr,
	        ppmpItemFormData.may,
	        ppmpItemFormData.jun,
	        ppmpItemFormData.jul,
	        ppmpItemFormData.aug,
	        ppmpItemFormData.sept,
	        ppmpItemFormData.oct,
	        ppmpItemFormData.nov,
	        ppmpItemFormData.dec
	    ].reduce((total, value) => total + (parseFloat(value) || 0), 0)
	})

	const managePpmpItemButtonIsDisabled = ref(true)

	const setAuthHeader = () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
	}

	const getItems = async () => {
		setAuthHeader()

		try{
			await axios.get(`${apiEndPoint}/api/list_of_department_ppmp_items_catalog`).then((res) => {
				ppmpItemOptions.value = res.data.retrievedData
			})
		}
		catch (err) {
			ElMessage({
				message: `Cannot load roles: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			ppmpGeneralDescLoading.value = false
		}
	}

	const getCode = async () => {
		setAuthHeader()

		try {
			await axios.get(`${apiEndPoint}/api/get_code/${router.params.id}`).then((res) => {
				ppmpItemFormData.code = res.data.code
			})
			managePpmpItemButtonIsDisabled.value = false
		}
		catch (err) {
			ElMessage({
				message: `Cannot generate code: ${err.message}`,
				type: 'error',
			})
		}
	}

	const selectItem = (item: Array) => {
		ppmpItemFormData.general_desc = item.general_desc
		ppmpItemFormData.unit = item.unit
		// ppmpItemFormData.mode_of_procurement = item.mode_of_procurement
	}

	const managePpmpItemForm = async (formType: String) => {
		setAuthHeader()

		try{
			managePpmpItemButtonIsDisabled.value = true
			if (formType === 'submit'){
				await axios.post(`${apiEndPoint}/api/add_ppmp_items`, { 
					ppmp_id: ppmpItemFormData.ppmp_id,
					code: ppmpItemFormData.code,
					category: ppmpItemFormData.category,
					general_desc: ppmpItemFormData.general_desc,
					unit: ppmpItemFormData.unit,
					quantity: totalQuantity.value,
					lumpsum: ppmpItemFormData.lumpsum,
					mode_of_procurement: ppmpItemFormData.mode_of_procurement,
					estimated_budget: ppmpItemFormData.estimated_budget,
					jan: ppmpItemFormData.jan,
					feb: ppmpItemFormData.feb,
					mar: ppmpItemFormData.mar,
					apr: ppmpItemFormData.apr,
					may: ppmpItemFormData.may,
					jun: ppmpItemFormData.jun,
					jul: ppmpItemFormData.jul,
					aug: ppmpItemFormData.aug,
					sept: ppmpItemFormData.sept,
					oct: ppmpItemFormData.oct,
					nov: ppmpItemFormData.nov,
					dec: ppmpItemFormData.dec
				}).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
				})
			}
			else{
				await axios.put(`${apiEndPoint}/api/update_ppmp_items/${props.data.id}`, {
					ppmp_id: ppmpItemFormData.ppmp_id,
					code: ppmpItemFormData.code,
					category: ppmpItemFormData.category,
					general_desc: ppmpItemFormData.general_desc,
					unit: ppmpItemFormData.unit,
					quantity: totalQuantity.value,
					lumpsum: ppmpItemFormData.lumpsum,
					mode_of_procurement: ppmpItemFormData.mode_of_procurement,
					estimated_budget: ppmpItemFormData.estimated_budget,
					jan: ppmpItemFormData.jan,
					feb: ppmpItemFormData.feb,
					mar: ppmpItemFormData.mar,
					apr: ppmpItemFormData.apr,
					may: ppmpItemFormData.may,
					jun: ppmpItemFormData.jun,
					jul: ppmpItemFormData.jul,
					aug: ppmpItemFormData.aug,
					sept: ppmpItemFormData.sept,
					oct: ppmpItemFormData.oct,
					nov: ppmpItemFormData.nov,
					dec: ppmpItemFormData.dec
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
			managePpmpItemButtonIsDisabled.value = false
			ppmpItemFormData.code = props.data.code
			ppmpItemFormData.category = props.data.category
			ppmpItemFormData.general_desc = props.data.general_desc
			ppmpItemFormData.unit = props.data.unit
			totalQuantity.value = props.data.lumpsum ? 0 : props.data.quantity
			ppmpItemFormData.lumpsum = props.data.lumpsum ? true : false
			ppmpItemFormData.mode_of_procurement = props.data.mode_of_procurement
			ppmpItemFormData.estimated_budget = props.data.estimated_budget
			ppmpItemFormData.jan = props.data.jan
			ppmpItemFormData.feb = props.data.feb
			ppmpItemFormData.mar = props.data.mar
			ppmpItemFormData.apr = props.data.apr
			ppmpItemFormData.may = props.data.may
			ppmpItemFormData.jun = props.data.jun
			ppmpItemFormData.jul = props.data.jul
			ppmpItemFormData.aug = props.data.aug
			ppmpItemFormData.sept = props.data.sept
			ppmpItemFormData.oct = props.data.oct
			ppmpItemFormData.nov = props.data.nov
			ppmpItemFormData.dec = props.data.dec
		}
		else
			getCode()
		getItems()
	})
</script>

<template>
 	<el-form :model="ppmpItemFormData" label-width="auto" :label-position="labelPosition">
 		<el-form-item>
 			<el-col :span="8" class="input-area">
		 		<el-form-item label="Code">
		 			<el-input v-model="ppmpItemFormData.code" placeholder="Loading..." readonly />
				</el-form-item>
		    </el-col>
 			<el-col :span="16">
			    <el-form-item label="General Description">
			      	<el-select
						v-model="ppmpItemFormData.general_desc"
						filterable
						placeholder="Select"
						:loading="ppmpGeneralDescLoading"
					>
						<el-option
							v-for="item in ppmpItemOptions"
							:key="item.id"
							:label="item.general_desc"
							:value="item.general_desc"
							@click="selectItem(item)"
						/>
					</el-select>
			    </el-form-item>
			</el-col>
		</el-form-item>
	    <div class="flex-area">
	    	<el-col :span="8" class="input-area">
		 		<el-form-item label="Category">
		 			<el-input v-model="ppmpItemFormData.category" />
				</el-form-item>
		    </el-col>
	    	<el-col :span="4" class="input-area">
		 		<el-form-item label="Unit">
		 			<el-input v-model="ppmpItemFormData.unit" readonly />
				</el-form-item>
		    </el-col>
	    	<el-col :span="4" class="input-area">
		 		<el-form-item>
		 			<template #label>
		 				Quantity <i class="note"> schedule/milestone activities </i>
		 			</template>
			      	<el-input class="full-width" v-model="totalQuantity" :min="1" :disabled="ppmpItemFormData.lumpsum" readonly />
			      	<el-checkbox v-model="ppmpItemFormData.lumpsum"> Lumpsum </el-checkbox>
				</el-form-item>
		    </el-col>
	    	<el-col :span="4" class="input-area">
		 		<el-form-item label="Mode of Procurement">
		 			<!-- <el-input v-model="ppmpItemFormData.mode_of_procurement" readonly /> -->
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
				</el-form-item>
		    </el-col>
	    	<el-col :span="4">
		 		<el-form-item label="Estimated Budget (₱)">
			      	<el-input type="number" v-model="ppmpItemFormData.estimated_budget" :min="0.00" x:precision="2" :step="0.1" />
				</el-form-item>
		    </el-col>
	    </div>
	    <el-form-item>
	    	<template #label>
				<el-divider>
					<el-text class="schedule-title">
						Schedule / Milestone of Activities
					</el-text> 
				</el-divider> 
	    	</template>
	    	<el-col :span="12" class="input-area">
	    		<el-form-item>
	    			<template #label>
	    				<el-text class="quarter-title" type="danger">
	    					1st Quarter
	    				</el-text>
	    			</template>
	    			<el-col :span="8" class="input-area">
	    				<el-form-item label="January">
					      	<el-input v-model="ppmpItemFormData.jan" type="number" />
						</el-form-item>
	    			</el-col>
	    			<el-col :span="8" class="input-area">
	    				<el-form-item label="February">
					      	<el-input v-model="ppmpItemFormData.feb" type="number" />
						</el-form-item>
	    			</el-col>
	    			<el-col :span="8">
	    				<el-form-item label="March">
					      	<el-input v-model="ppmpItemFormData.mar" type="number" />
						</el-form-item>
	    			</el-col>
	    		</el-form-item>
	    	</el-col>
    		<el-col :span="12">
	    		<el-form-item>
	    			<template #label>
	    				<el-text class="quarter-title" type="danger">
	    					2nd Quarter
	    				</el-text>
	    			</template>
	    			<el-col :span="8" class="input-area">
	    				<el-form-item label="April">
					      	<el-input v-model="ppmpItemFormData.apr" type="number" />
						</el-form-item>
	    			</el-col>
	    			<el-col :span="8" class="input-area">
	    				<el-form-item label="May">
					      	<el-input v-model="ppmpItemFormData.may" type="number" />
						</el-form-item>
	    			</el-col>
	    			<el-col :span="8">
	    				<el-form-item label="June">
					      	<el-input v-model="ppmpItemFormData.jun" type="number" />
						</el-form-item>
	    			</el-col>
	    		</el-form-item>
	    	</el-col>
    		<el-col :span="12" class="input-area form-item-top-padding">
	    		<el-form-item>
	    			<template #label>
	    				<el-text class="quarter-title" type="danger">
	    					3rd Quarter
	    				</el-text>
	    			</template>
	    			<el-col :span="8" class="input-area">
	    				<el-form-item label="July">
					      	<el-input v-model="ppmpItemFormData.jul" type="number" />
						</el-form-item>
	    			</el-col>
	    			<el-col :span="8" class="input-area">
	    				<el-form-item label="August">
					      	<el-input v-model="ppmpItemFormData.aug" type="number" />
						</el-form-item>
	    			</el-col>
	    			<el-col :span="8">
	    				<el-form-item label="September">
					      	<el-input v-model="ppmpItemFormData.sept" type="number" />
						</el-form-item>
	    			</el-col>
	    		</el-form-item>
	    	</el-col>
    		<el-col :span="12" class="form-item-top-padding">
	    		<el-form-item>
	    			<template #label>
	    				<el-text class="quarter-title" type="danger">
	    					4th Quarter
	    				</el-text>
	    			</template>
	    			<el-col :span="8" class="input-area">
	    				<el-form-item label="October">
					      	<el-input v-model="ppmpItemFormData.oct" type="number" />
						</el-form-item>
	    			</el-col>
	    			<el-col :span="8" class="input-area">
	    				<el-form-item label="November">
					      	<el-input v-model="ppmpItemFormData.nov" type="number" />
						</el-form-item>
	    			</el-col>
	    			<el-col :span="8">
	    				<el-form-item label="December">
					      	<el-input v-model="ppmpItemFormData.dec" type="number" />
						</el-form-item>
	    			</el-col>
	    		</el-form-item>
	    	</el-col>
	    </el-form-item>
	    <el-button v-if="props.update" size="large" class="submit-width" type="warning" @click="managePpmpItemForm('update')" :disabled="managePpmpItemButtonIsDisabled"> Update </el-button> 

	    <el-button v-else size="large" class="submit-width" type="success" @click="managePpmpItemForm('submit')" :disabled="managePpmpItemButtonIsDisabled"> Add </el-button> 
  	</el-form>
</template>

<style scoped>
	.submit-width {
		display: block;
		float: right;
		width: 10%;
	}

	.full-width {
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

	.flex-area {
		display: flex;
	}

	.input-area {
		padding: 0 10px 0 0;
	}

	.note {
		line-height: 0;
		color: #67c23a;
		font-size: 10px;
	}

	.form-item-top-padding {
		padding-top: 10px;
	}

	.el-form {
		padding-bottom: 40px;
	}
</style>