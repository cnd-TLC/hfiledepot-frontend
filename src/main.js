import './assets/main.css'

// vue app
import { createApp } from 'vue'
import App from './App.vue'

// element plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// router
import router from './router'

// vue auth 3
import { createAuth } from 'vue-auth3'
import driverAuthBearer from 'vue-auth3/drivers/auth/bearer'
import driverHttpAxios from 'vue-auth3/drivers/http/axios'

// apex chart
import VueApexCharts from 'vue3-apexcharts'

// api endpoint
import { apiEndPoint } from '@/constant/data'


const auth = createAuth({
	plugins: {
		router,
	},
	drivers: {
		auth: driverAuthBearer,
		http: driverHttpAxios,
	},
	rememberkey: 'auth_remember',
	tokenDefaultKey: 'auth_token_default',
 	tokenImpersonateKey: 'auth_token_impersonate',
	stores: ['storage', 'cookie'],
	loginData: {
		method: 'post',
  		url: apiEndPoint + '/api/login',
  		redirect: { name: 'dashboard' },
  		staySignedIn: true,
  		fetchUser: true,
  		// rememberMe: true,
	},
	logoutData: {
  		method: 'post',
  		url: apiEndPoint + '/api/logout',
  		makeRequest: true,
  		redirect: { name: 'signin' }
  	},
	fetchData: {
		url: apiEndPoint + '/api/user', 
		method: 'get',
		enabled: true
	},
	refreshData: { enabled: true }
})



const app = createApp(App)

app.config.warnHandler = function (msg, vm, trace) {
	if (msg.includes('Failed to resolve component: center')) {
		return;
	}
	console.warn(msg, vm, trace);
}

app.use(router).use(ElementPlus).use(VueApexCharts).use(auth).mount('#app')
