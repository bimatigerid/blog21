// template/index.js

import { handlePostsRequest } from './handlers/handlePosts.js';
import { handleApiRequest } from './handlers/handleApi.js';
import { handleSitemapRequest } from './handlers/handleSitemap.js';
import { handlePageRequest } from './handlers/handlePage.js';

/**
 * Ini adalah titik masuk utama (entrypoint) untuk Cloudflare Worker Anda.
 * Tugasnya adalah memeriksa URL yang diminta dan meneruskannya ke handler yang sesuai.
 */
export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const path = url.pathname;

		try {
			// Aturan routing sederhana berdasarkan path URL
			if (path.startsWith('/api')) {
				return handleApiRequest(request, env);
			}

			if (path === '/sitemap.xml') {
				return handleSitemapRequest(request, env);
			}

			// Contoh route untuk halaman statis seperti /about atau /contact
			if (path === '/about' || path === '/contact') {
                const slug = path.substring(1); // Mengambil "about" atau "contact" dari "/about"
				return handlePageRequest(slug, env);
			}
			
			// Jika tidak cocok dengan rute di atas, diasumsikan sebagai request untuk post.
			// handlePostsRequest akan menangani halaman utama ('/') dan halaman post tunggal ('/slug-post').
			return handlePostsRequest(request, env);

		} catch (error) {
			// Tangani error tak terduga
			console.error("Router Fetch Error:", error);
			return new Response("Terjadi kesalahan internal pada server.", { status: 500 });
		}
	},
};