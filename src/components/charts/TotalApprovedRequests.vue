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
	]);

	const requestTrackerOptions = ref({
		chart: {
			type: 'line',
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
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'straight',
			width: 4
		},
		markers: {
			size: 6
		},
		xaxis: {
			categories: ['Budget Office', 'City Treasurer', 'Mayor\'s Office', 'BAC Office', 'CGSO', 'Accounting Office'],
			// tickPlacement: 'between'
		},
		// yaxis: [
		// 	{
		// 		axisBorder: {
		// 			show: true
		// 		},
		// 	},
		// 	{
		// 		opposite: true,
		// 		axisBorder: {
		// 			show: true
		// 		},
		// 		labels: {
		// 			show: false
		// 		}
		// 	}
		// ],
		yaxis: {
			min: 0,
			labels: {
				formatter: function (value) {
					return Math.floor(value)
				}
			}
		},
		grid: {  
			show: true,
			position: 'back',     
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
			// theme: 'dark', 
			marker: {
				show: true
			},
			// Adding custom styles for tooltip content
			custom: function({ series, seriesIndex, dataPointIndex, w }) {
				return `
					<div class="hoverArea">
						${series[seriesIndex][dataPointIndex]} approved request/s
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

<style >
	.hoverArea {
        width: auto;
        height: 20px;
        background-color: #606266;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        text-align: center;
        padding: 0 20px;
    }
</style>