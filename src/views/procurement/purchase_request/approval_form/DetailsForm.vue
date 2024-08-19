<script lang="ts" setup>
	import { reactive, ref, onMounted } from 'vue'
	import type { FormProps } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import { ElMessage } from 'element-plus'
	import axios from 'axios'

	const props = defineProps({
		data: Object,
		department: String
	})

	const labelPosition = ref<FormProps['labelPosition']>('top')
	const emit = defineEmits(['updateButtonIsClicked'])


	const accountCodesOptions = ref([])
	const accountCodesLoading = ref(true)

	const prFormData = reactive({
		pr_no: props.data.pr_no,
		ris_no: props.data.ris_no,
		air_no: props.data.air_no,
		ics_no: props.data.ics_no,
		insp_no: props.data.insp_no,
		section: props.data.department,
		fund: props.data.fund,
		fpp: props.data.fpp,
		bac_resolution: props.data.bac_resolution ? true : false,
		canvass: props.data.canvass ? true : false,
		purchase_order: props.data.purchase_order ? true : false,
		obr: props.data.obr ? true : false,
		ris: props.data.ris ? true : false,
		inspection_acceptance: props.data.inspection_acceptance ? true : false,
		abstract: props.data.abstract ? true : false,
		voucher: props.data.voucher ? true : false,
		notice_of_awards: props.data.notice_of_awards ? true : false,
		notice_to_proceed: props.data.notice_to_proceed ? true : false,
		contract_of_agreement: props.data.contract_of_agreement ? true : false,
		lcrb: props.data.lcrb ? true : false,

		bac_resolution_date: props.data.bac_resolution,
		canvass_date: props.data.canvass,
		purchase_order_date: props.data.purchase_order,
		obr_date: props.data.obr,
		ris_date: props.data.ris,
		inspection_acceptance_date: props.data.inspection_acceptance,
		abstract_date: props.data.abstract,
		voucher_date: props.data.voucher,
		notice_of_awards_date: props.data.notice_of_awards,
		notice_to_proceed_date: props.data.notice_to_proceed,
		contract_of_agreement_date: props.data.contract_of_agreement,
		lcrb_date: props.data.lcrb,
	})

	const updatePrButtonIsDisabled = ref(false)

	const setAuthHeader = () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
	}

	const updatePr = async () => {
		setAuthHeader()

		try{
			await axios.put(`${apiEndPoint}/api/set_pr_details/${props.data.id}`, {
					status: 'Updated',
					pr_no: prFormData.pr_no,
					ris_no: prFormData.ris_no,
					air_no: prFormData.air_no,
					ics_no: prFormData.ics_no,
					insp_no: prFormData.insp_no,
					section: prFormData.section,
					fund: prFormData.fund,
					fpp: prFormData.fpp,

					bac_resolution: prFormData.bac_resolution,
					canvass: prFormData.canvass,
					purchase_order: prFormData.purchase_order,
					obr: prFormData.obr,
					ris: prFormData.ris,
					inspection_acceptance: prFormData.inspection_acceptance,
					abstract: prFormData.abstract,
					voucher: prFormData.voucher,
					notice_of_awards: prFormData.notice_of_awards,
					notice_to_proceed: prFormData.notice_to_proceed,
					contract_of_agreement: prFormData.contract_of_agreement,
					lcrb: prFormData.lcrb,

					bac_resolution_date: prFormData.bac_resolution_date,
					canvass_date: prFormData.canvass_date,
					purchase_order_date: prFormData.purchase_order_date,
					obr_date: prFormData.obr_date,
					ris_date: prFormData.ris_date,
					inspection_acceptance_date: prFormData.inspection_acceptance_date,
					abstract_date: prFormData.abstract_date,
					voucher_date: prFormData.voucher_date,
					notice_of_awards_date: prFormData.notice_of_awards_date,
					notice_to_proceed_date: prFormData.notice_to_proceed_date,
					contract_of_agreement_date: prFormData.contract_of_agreement_date,
					lcrb_date: prFormData.lcrb_date,
				}).then((res) => {
					ElMessage({
						message: res.data.message,
						type: 'success',
					})
				})

			updatePrButtonIsDisabled.value = true
			emit('updateButtonIsClicked')
		}
		catch (err) {
			ElMessage({
				message: `Cannot update: ${err.message}`,
				type: 'error',
			})
		}
		finally {
			updatePrButtonIsDisabled.value = false
		}
	}

	const getAccountCodes = async () => {
		setAuthHeader()

		try {
			await axios.get(`${apiEndPoint}/api/list_of_account_codes`).then((res) => {
				accountCodesOptions.value = res.data.retrievedData
			})
		}
		catch (err) {
			ElMessage({
				message: `Cannot load account cods: ${err.message}`,
				type: 'error'
			})
		}
		finally {
			accountCodesLoading.value = false
		}
	}

	onMounted(() => {
		getAccountCodes()
	})
</script>

<template>
 	<el-form :model="prFormData" label-width="auto" :label-position="labelPosition">
 		<el-row v-if="props.department == 'Bids and Awards Committee (BAC)'">
 			<el-col :span="24">
 				<el-row>
 					<el-col :span="12">
					    <el-form-item label="PR Number" class="input-area">
					      	<el-input v-model="prFormData.pr_no" />
					    </el-form-item>
					</el-col>
 					<el-col :span="12">
					    <el-form-item label="FPP">
					      	<el-input v-model="prFormData.fpp" />
					    </el-form-item>
					</el-col>
				</el-row>
			    <el-form-item label="Section">
			      	<el-input type="textarea" v-model="prFormData.section" readonly />
			    </el-form-item>
			</el-col>
 			<el-col :span="24" class="inclusions">
 				<el-form-item>
 					<template #label> 
 						<el-text class="sub-module-title" type="danger">
	    					Inclusions
	    				</el-text>
 					</template>
					<el-row class="inclusions-field">
						<el-col :span="12" class="input-area">
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.bac_resolution"> BAC Resolution </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.bac_resolution_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.bac_resolution"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.canvass"> Canvass </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.canvass_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.canvass"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.purchase_order"> Purchase Order </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.purchase_order_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.purchase_order"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.obr"> OBR </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.obr_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.obr"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.ris"> RIS </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.ris_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.ris"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.inspection_acceptance"> Inspection/Acceptance </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.inspection_acceptance_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.inspection_acceptance"
										/>
									</el-form-item>
								</el-col>
							</el-row>
						</el-col>
						<el-col :span="12">
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.abstract"> Abstract </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.abstract_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.abstract"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.voucher"> Voucher </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.voucher_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.voucher"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.notice_of_awards"> Notice of Awards </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.notice_of_awards_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.notice_of_awards"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.notice_to_proceed"> Notice to Proceed </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.notice_to_proceed_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.notice_to_proceed"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.contract_of_agreement"> Contract of Agreement </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.contract_of_agreement_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.contract_of_agreement"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="12">
									<el-checkbox v-model="prFormData.lcrb"> LCRB </el-checkbox>
								</el-col>
								<el-col :span="12">
									<el-form-item>
										<el-date-picker
											v-model="prFormData.lcrb_date"
											type="date"
											placeholder="Pick a day"
											size="small"
											:disabled="!prFormData.lcrb"
										/>
									</el-form-item>
								</el-col>
							</el-row>
						</el-col>
					</el-row>
				</el-form-item>
 			</el-col>
		</el-row>
		<el-row v-if="props.department == 'City Budget Office (CBO)'">
			<el-col :span="24">
		    	<el-form-item label="Fund">
		     		<!-- <el-input v-model="prFormData.fund" /> -->
		     		<el-select
						v-model="prFormData.fund"
						filterable
						placeholder="Select"
						:loading="accountCodesLoading"
					>
						<el-option
							v-for="item in accountCodesOptions"
							:key="item.id"
							:label="`${item.code} - ${item.account_title}`"
							:value="`${item.code} - ${item.account_title}`"
						/>
					</el-select>
		    	</el-form-item>
			</el-col>
		</el-row>
		<el-row v-if="props.department == 'City General Services Office (CGSO)'">
 			<el-col :span="24">
			    <el-form-item label="RIS Number">
			      	<el-input v-model="prFormData.ris_no" />
			    </el-form-item>
			    <el-form-item label="AIR Number">
			      	<el-input v-model="prFormData.air_no" />
			    </el-form-item>
			    <el-form-item label="ICS Number">
			      	<el-input v-model="prFormData.ics_no" />
			    </el-form-item>
			    <el-form-item label="INSP Number">
			      	<el-input v-model="prFormData.insp_no" />
			    </el-form-item>
			</el-col>
		</el-row>
	    <el-button size="large" class="submit-width" type="success" @click="updatePr" :disabled="updatePrButtonIsDisabled"> Update </el-button> 
  	</el-form>
</template>

<style scoped>
	.submit-width {
		display: block;
		float: right;
		width: auto;
	}

	.input-area {
		padding: 0 10px 0 0;
	}

	.full-width {
		display: block;
		width: 100%;
	}

	.el-form {
		padding-bottom: 40px;
	}

	.sub-module-title {
		font-size: 14px;
		font-weight: 500;
	}

	.inclusions {
		justify-content: center;
		align-items: center;
	}

	.inclusions-field .el-col .el-row {
		align-items: center;
	}
</style>