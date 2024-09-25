<script lang="ts" setup>
	import { ref } from 'vue';
	import VueApexCharts from 'vue3-apexcharts';

	const props = defineProps({
			data: Array
		})

	const series = ref([
		{
			name: '',
			data: props.data,
			color: '#529b2e'
		}
	]);

	const categories = [
		'CMO', 'CAdmO', 'CToO', 'CPDO', 'CBO', 'CAccO', 'CGSO', 
		'CLO', 'CHRMO', 'CZAO', 'CTO', 'CAsO', 
		'CCRO', 'CHO', 'CSWDO', 'CEO', 'CASO', 'CENRO', 
		'CVO', 'CDRRMO', 'PL', 'PI', 'BAPAS', 'TS', 'MO', 
		'DILG', 'SP', 'CICTO', 'BAC'
	]

	const categoriesNames = [
		'City Mayor\'s Office', 'City Administrator\'s Office', 
		'City Tourism Office', 'City Planning and Development Office', 
		'City Budget Office', 'City Accountant\'s Office', 
		'City General Services Office', 'City Legal Office', 
		'City Human Resource Management Office', 
		'City Zoning Administration Office', 
		'City Treasurer\'s Office', 'City Assessor\'s Office', 
		'City Civil Registrar\'s Office', 'City Health Office', 
		'City Social Welfare and Development Office', 
		'City Engineer\'s Office', 'City Agriculture Services Office', 
		'City Environment and Natural Resources Office', 
		'City Veterinary Office', 
		'City Disaster and Risk Reduction Management Office', 
		'Permits and Licensing', 'Public Information', 'BAPAS', 
		'Traffic and Security', 'Market Operations', 
		'DILG-Sorsogon City', 'Sangguniang Panlungsod', 
		'City Information and Communications Technology Office', 
		'Bids and Awards Committee'
	]

	const requestTrackerOptions = ref({
		chart: {
			type: 'bar',
			zoom: {
				enabled: true
			},
			toolbar: {
		        show: false,
		        // offsetX: -20,
		        offsetX: -50,
		        offsetY: 0,
		        tools: {
					download: true,
					selection: false,
					zoom: false,
					zoomin: false,
					zoomout: false,
					pan: false,
					reset: false,
					customIcons: []
		        },
		        export: {
		          	csv: {
			            filename: undefined,
		          	},
		          	svg: {
		            	filename: undefined,
		          	},
		          	png: {
		            	filename: undefined,
		          	}
		        },
		        autoSelected: 'zoom' 
	      	},
		},
		plotOptions: {
		    bar: {
		      	// horizontal: true,
		      	// distributed: true,
		    }
		},
		dataLabels: {
			enabled: true,
			style: {
				colors: ['#ccc']
			}
		},
		markers: {
			size: 6
		},
		xaxis: {
			categories: categories,
			// tickPlacement: 'between'
			labels: {
				style: {
					colors: 'var(--el-menu-text-color)',
					fontSize: '10',
				}
			}
		},
		yaxis: {
			labels: {
				show: false
			}
		},
		grid: {  
			show: true,
			position: 'back',     
            strokeDashArray: 2, // Style of the grid lines (dashed)
			xaxis: {
				lines: {
					show: true
				}
			},
			yaxis: {
				lines: {
					show: true
				}
			},
		},
		tooltip: {
			enabled: true, 
			marker: {
				show: true 
			},
			custom: function({ series, seriesIndex, dataPointIndex, w }) {
				const category = categoriesNames[dataPointIndex]
				const value = series[seriesIndex][dataPointIndex]
				return `
					<div class="totalRequestsHoverArea">
						<div class="totalRequestsTooltipTitle">
							${category}
						</div>
						<hr class="totalRequestsLine"/>
						<div class="totalRequestsTooltipBody">
						 <div class="circle"> </div> ${value} purchase request/s sent
						</div>
					</div>
				`;
			}
		},
	})

	// onMounted (() => {
	// 	updateTooltipTheme()
	// })
</script>

<template>
	<vue-apex-charts class="apex-chart" :options="requestTrackerOptions" :series="series"></vue-apex-charts>
</template>

<style>
	.totalRequestsHoverArea {
		display: flex;
		flex-direction: column;
		text-align: left;
        width: auto;
        height: auto;
        color: var(--el-menu-text-color) !important;
        padding: 0 !important;
    }
    .totalRequestsTooltipTitle, .totalRequestsTooltipBody, .totalRequestsLine {
    	display: block;
    	width: 100%;
    }

    .totalRequestsTooltipTitle {
    	background-color: var(--el-bg-color-overlay);
    	padding: 5px 20px;
    }

    .totalRequestsTooltipBody {
        background-color: var(--el-bg-color-overlay);
        padding: 5px 20px;
        display: flex;
        align-items: center;
    }

    .circle {
    	height: 10px;
    	width: 10px;
    	background-color: #529b2e;
    	margin-right: 10px;
    	border-radius: 100px;
    }
</style>