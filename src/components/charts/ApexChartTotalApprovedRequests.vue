<script lang="ts" setup>
	import { ref } from 'vue';
	import VueApexCharts from 'vue3-apexcharts';

	// const tooltipTheme = ref('dark')

	// const updateTooltipTheme = () => {
	// 	const colorScheme = localStorage.getItem('vueuse-color-scheme');
	// 	tooltipTheme.value = colorScheme == 'light' ? 'light' : 'dark'
	// }

	const props = defineProps({
			data: Array
		})

	const series = ref([
		{
			name: '',
			data: props.data,
			color: '#529b2e'
		}
	])

	const categoriesNames = [
		'City Budget Office', , 
		'City Treasurer\'s Office', 
		'City Mayor\'s Office', 
		'Bids and Awards Committee',
		'City General Services Office', 
		'City Accountant\'s Office'
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
		      	horizontal: true,
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
			// tickPlacement: 'between'
			categories: ['Budget', 'Treasurer', 'Mayor', 'BAC', 'CGSO', 'Accounting'],
			labels: {
				show: false,
			}
		},
		yaxis: {
			labels: {
				style: {
					colors: 'var(--el-menu-text-color)',
					fontSize: '10',
				}
			}
		},
		grid: {  
			show: true,
			position: 'back',     
            strokeDashArray: 2, // Style of the grid lines (dashed)
			xaxis: {
				lines: {
					show: false
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
					<div class="totalApprovedHoverArea">
						<div class="totalApprovedTooltipTitle">
							${category}
						</div>
						<hr class="totalApprovedLine"/>
						<div class="totalApprovedTooltipBody">
						 <div class="circle"> </div> ${value} approved request/s
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
	.totalApprovedHoverArea {
		display: flex;
		flex-direction: column;
		text-align: left;
        width: auto;
        height: auto;
        color: var(--el-menu-text-color) !important;
        padding: 0 !important;
    }
    .totalApprovedTooltipTitle, .totalApprovedTooltipBody, .totalApprovedLine {
    	display: block;
    	width: 100%;
    }

    .totalApprovedTooltipTitle {
    	background-color: var(--el-bg-color-overlay);
    	padding: 5px 20px;
    }

    .totalApprovedTooltipBody {
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