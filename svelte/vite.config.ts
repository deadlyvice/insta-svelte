import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
export default defineConfig({
	plugins: [sveltekit(), tailwindcss(), UnoCSS()],

	// server: {
	// 	proxy: {
	// 		'/api': 'http://127.0.0.1:3000',
	// 	},
	// },
})
