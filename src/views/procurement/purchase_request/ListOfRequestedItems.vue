<script lang='ts' setup>
	import { ref, onMounted } from 'vue'
	import { ComponentSize } from 'element-plus'
	import { apiEndPoint } from '@/constant/data'
	import axios from 'axios'
	import ItemForm from '@/views/procurement/purchase_request/item_form/ItemForm.vue'
	import RemoveForm from '@/views/procurement/purchase_request/item_form/RemoveForm.vue'
	import { useRouter } from 'vue-router'

	const router = useRouter().currentRoute.value

	const overallCost = ref(0)
	const listPrItemTableData  = ref([])
	const clickedRow = ref([])
	const showItemForm = ref(false)
	const showRemoveForm = ref(false)
	const totalRecords = ref(1)
	const pageSize = ref(5)
	const currentPage = ref(1)
	const size = ref<ComponentSize>('default')
	const loading = ref(true)

	const showForm = (formName: String, data: Array) => {
		clickedRow.value = data
		if (formName === 'ItemForm')
			showItemForm.value = true
		if (formName === 'RemoveForm')
			showRemoveForm.value = true
	}

	const formatNumber = (number: Integer) => {
		number = parseFloat(number).toFixed(2)
		let numStr = number.toString();
	    let parts = numStr.split(".");
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    return parts.join(".");
	}

	const loadPrItemData = async () => {
		const token = JSON.parse(localStorage.auth_token_default);
		if(token){
			axios.defaults.headers = {
				accept: "application/json",
				Authorization: `Bearer ${token}`
			}  
		}
		try {
			await axios.get(apiEndPoint + '/api/list_of_pr_items/' + router.params.id + '/' + pageSize.value + '/?page=' + currentPage.value).then((res) => {
				listPrItemTableData.value = res.data.retrievedData
				const calculateCost = listPrItemTableData.value.reduce((acc, current) => {
				  return acc + (parseFloat(current.unit_cost) * parseInt(current.quantity));
				}, 0);
				overallCost.value = calculateCost.toFixed(2)
				totalRecords.value = res.data.total
			})
			showItemForm.value = false
			showRemoveForm.value = false
		}
		catch (err) {
			console.log('Error loading data', err)
		}
		finally {
			loading.value = false
		}
	}

	const handleSizeChange = (val: number) => {
		loadPrItemData()
	}
	const handleCurrentChange = (val: number) => {
		loadPrItemData()
	}

	onMounted(() => {
		try {
			loadPrItemData()
		}
		catch (err) {
			console.log('Error loading data', err)
		}
	})
</script>

<template>
	<el-dialog destroy-on-close :overflow="false" v-model="showItemForm" title="Item Form" width="400">
		<item-form @addButtonIsClicked="loadPrItemData" />
	</el-dialog>
	<el-dialog destroy-on-close :overflow="false" v-model="showRemoveForm" title="Remove Item" width="400">
		<remove-form @removeButtonIsClicked="loadPrItemData" :data="clickedRow" />
	</el-dialog>

	<el-text class="title"> Requested Items List </el-text>

	<el-card shadow="never">
		<el-skeleton animated :loading="loading">
			<template #template>
				<div class="custom-card">
					<el-skeleton-item variant="button" style="width: 7%" />
				</div>
				<el-divider />
				<el-skeleton-item v-for="n in 10" variant="text" style="width: 100%" />
				<el-divider />
				<div class="custom-card">
					<el-skeleton-item variant="rect" style="width: 40%" />
				</div>
			</template>
			<template #default>
				<div class="custom-card">
					<el-button type="success" @click="showForm('ItemForm', null)"> Add Item </el-button>
					<el-divider />
					<el-table :data="listPrItemTableData" stripe border>
						<el-table-column prop="item_no" label="Item No." sortable width="150"/>
						<el-table-column prop="item_description" label="Item Description" sortable>
							<template #default="data">
								<el-text> {{ data.row.item_description }} </el-text>
								<br />
								<el-text class="category" type="warning"> <i> {{ data.row.category }} </i> </el-text>
							</template>
						</el-table-column>
						<el-table-column prop="quantity" label="Quantity" width="120">
							<template #default="data">
								<el-text>
								{{ data.row.quantity }} {{ data.row.unit }}<span v-if="data.row.unit != null">/s</span>
								</el-text>
							</template>
						</el-table-column>
						<el-table-column label="Unit Cost"  width="150">
							<template #default="data">
								<el-text> ₱ {{ formatNumber(data.row.unit_cost) }} </el-text>
							</template>
						</el-table-column>
						<el-table-column label="Total Cost"  width="150">
							<template #default="data">
								<el-text> ₱ {{ formatNumber(data.row.unit_cost * data.row.quantity) }} </el-text>
			 				</template>
						</el-table-column>
						<el-table-column prop="action" label="Action" width="170">
							<template #default="data">
								<el-button class="action-button" type="danger" @click="showForm('RemoveForm', data.row)"> Remove </el-button>
							</template>
						</el-table-column>
					</el-table>
					<div class="total-card">
						<el-text class="total"> Total : </el-text>
						<el-text class="total number"> ₱ {{ formatNumber(overallCost) }} </el-text>
					</div>
					<el-divider />
					<el-pagination
						v-model:current-page="currentPage"
						v-model:page-size="pageSize"
						:page-sizes="[5, 10, 50, 100]"
						:size="size"
						layout="total, sizes, prev, pager, next, jumper"
						:total="totalRecords"
						@size-change="handleSizeChange"
						@current-change="handleCurrentChange"
					/>
				</div>
			</template>
		</el-skeleton>
	</el-card>
</template>

<style scoped>
	.title {
		font-size: 20px;
		font-weight: 400;
	}

	.category {
		font-size: 10px;
		line-height: -10;
	}

	.action-button {
		width: 100%;
		margin-bottom: 3px;
	}

	.custom-card {
		text-align: right;
	}

	.total-card {
		margin: 20px 20px !important;
	}

	.total {
		font-size: 20px;
		font-weight: 500;
	}

	.el-card {
		margin-top: 15px;
	}

	.el-pagination {
		justify-content: right;
	}
</style>