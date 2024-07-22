<script setup>
	import lineChart from '@/components/charts/Line.vue'
</script>

<template>
	<el-text class="title"> Dashboard </el-text>
	<el-row>
		<el-col :span="16">
			<el-row>
				<el-col :span="8">
					<el-card shadow="never" class="summary">
						<el-text class="dashboard-card-title" type="info"> No. of Ongoing Requests </el-text>
						<br />
						<el-text class="summary-content"> 77 </el-text>
					</el-card>
				</el-col>
				<el-col :span="8">
					<el-card shadow="never" class="summary">
						<el-text class="dashboard-card-title" type="info"> No. of Approved Requests </el-text>
						<br />
						<el-text class="summary-content"> 41 </el-text>
					</el-card>
				</el-col>
				<el-col :span="8">
					<el-card shadow="never" class="summary">
						<el-text class="dashboard-card-title" type="info"> No. of Rejected Requests </el-text>
						<br />
						<el-text class="summary-content"> 13 </el-text>
					</el-card>
				</el-col>
				<el-col :span="24">
					<el-card shadow="never">
						<el-text class="dashboard-card-title" type="info"> No. of Requests for Approval per Office </el-text>
						<br />
						<line-chart :data="[12, 5, 23, 4, 10, 5]" />
					</el-card>
				</el-col>
			</el-row>
		</el-col>
		<el-col :span="8">
			<el-card shadow="never">

			</el-card>
		</el-col>
	</el-row>
</template>

<style scoped>
	.title {
		font-size: 20px;
		font-weight: 400;
	}

	.apex-chart {
		width: 100% !important;
	}

	.summary {
		height: 20vh;
	}

	.dashboard-card-title {
		font-size: 16px;
		font-weight: 500;
	}

	.summary-content {
		font-size: 40px;
		font-weight: 700;
	}

	.el-col {
		padding: 0 5px;
	}

	.el-card {
		margin-top: 15px;
	}
</style>