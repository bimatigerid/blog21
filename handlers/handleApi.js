// template/handlers/handleApi.js

import { getPosts } from './handlePosts.js'; // Impor fungsi getPosts yang sudah benar

/**
 * Handler utama untuk endpoint API (/api).
 * Fungsi ini mengambil data dari GitHub dan menyajikannya sebagai JSON.
 * @param {Request} request - Objek request yang masuk.
 * @param {object} env - Variabel lingkungan Cloudflare.
 */
export async function handleApiRequest(request, env) {
	try {
		// 1. Ambil data posts secara online dari GitHub melalui fungsi terpusat
		const postsData = await getPosts(env);

		// 2. Ubah data menjadi string JSON yang rapi
		const data = JSON.stringify(postsData, null, 2);

		// 3. Kirim data sebagai response dengan header yang benar
		return new Response(data, {
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
				'Access-Control-Allow-Origin': '*', // Izinkan akses dari mana saja (CORS)
                'Cache-Control': 's-maxage=3600' // Cache di server selama 1 jam
			},
		});
	} catch (error) {
		// Jika terjadi error saat pengambilan data
		console.error('API Error:', error);
		const errorResponse = JSON.stringify({
            status: 'error',
            message: 'Gagal mengambil data dari sumber.',
            details: error.message
        });
		return new Response(errorResponse, {
			status: 500, // Internal Server Error
			headers: { 
                'Content-Type': 'application/json' 
            },
		});
	}
}