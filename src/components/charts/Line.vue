<script lang="ts" setup>
	import { ref } from 'vue';
	import VueApexCharts from 'vue3-apexcharts';

	const props = defineProps({
			data: Array
		})

	const series = ref([
		{
			name: 'No. of requests for approval',
			data: props.data,
			color: '#606266'
		}
	]);

	const requestTrackerOptions = ref({
		chart: {
			type: 'line',
			zoom: {
				enabled: true
			},
			toolbar: {
	        show: true,
	        offsetX: -20,
	        offsetY: 0,
	        tools: {
				download: true,
				selection: true,
				zoom: true,
				zoomin: true,
				zoomout: true,
				pan: true,
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
			width: 2
		},
		markers: {
			size: 7
		},
		xaxis: {
			categories: ['Budget Office', 'City Treasurer', 'Mayor\'s Office', 'BAC Office', 'CGSO', 'Accounting Office'],
			tickPlacement: 'between'
		},
		yaxis: [
			{
				axisBorder: {
					show: true
				},
			},
			{
				opposite: true,
				axisBorder: {
					show: true
				},
				labels: {
					show: false
				}
			}
		],
	});
</script>

<template>
	<vue-apex-charts class="apex-chart" :options="requestTrackerOptions" :series="series"></vue-apex-charts>
</template>