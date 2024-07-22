<script lang='ts' setup>
	import { useRouter } from 'vue-router'

	const router = useRouter()

	const getBack = () => {
		router.push({ name: 'dashboard' })
	}
</script>

<template>
	<el-container>
		<el-main>
			<el-row>
				<el-col :span="8"> </el-col>
				<el-col :span="8">
					<el-space direction="vertical">
						<el-text type="danger" class="fof"> 404 </el-text>
						<el-text type="danger" class="page-not-found"> Page NOT Found </el-text>
					</el-space>
					<el-button type="danger" @click="getBack"> Nothing to see here, get back </el-button>
				</el-col>
				<el-col :span="8"> </el-col>
			</el-row>
		</el-main>
	</el-container>
</template>

<style scoped>
	.el-col {
		text-align: center;
	}

	.el-button {
		margin-top: 30px;
	}

	.fof {
		font-size: 200px;
		font-weight: 700;
		line-height: 1;
		margin-top: 100px;
	}

	.page-not-found {
		font-size: 40px;
		font-weight: 600;
	}
</style>