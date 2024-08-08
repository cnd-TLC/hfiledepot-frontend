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

// dark mode
import 'element-plus/theme-chalk/dark/css-vars.css'

// apex chart
import VueApexCharts from 'vue3-apexcharts'


// font awesome
import '@fortawesome/fontawesome-free/css/all.css';

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
  		url: `${apiEndPoint}/api/login`,
  		redirect: { name: 'dashboard' },
  		staySignedIn: true,
  		fetchUser: true,
  		// rememberMe: true,
	},
	logoutData: {
  		method: 'post',
  		url: `${apiEndPoint}/api/logout`,
  		makeRequest: true,
  		redirect: { name: 'signin' }
  	},
	fetchData: {
		method: 'get',
		url: `${apiEndPoint}/api/user`, 
		enabled: true
	},
	refreshData: { 
		method: 'get',
		url: `${apiEndPoint}/api/refresh`, 
		interval: 1,
		enabled: true 
	}
})



const app = createApp(App)

app.config.warnHandler = function (msg, vm, trace) {
	if (msg.includes('Failed to resolve component: center')) {
		return;
	}
	if (msg.includes('Extraneous non-emits event listeners (updateUserInfo) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the')) {
		return ;
	}
	console.warn(msg, vm, trace);
}

app.use(router).use(ElementPlus).use(VueApexCharts).use(auth).mount('#app')
