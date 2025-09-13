// template/handlers/handleApi.js

import { getPosts } from './handlePosts.js';

// Fungsi pencari gambar yang sama persis dengan yang ada di handlePosts.js
function getFirstImage(htmlContent) {
    if (!htmlContent) return 'https://placehold.co/300x200/png';
    const regex = /<img[^>]+src="([^"]+)"/g;
    const matches = [...htmlContent.matchAll(regex)];
    for (const match of matches) {
        const imageUrl = match[1];
        if (imageUrl && !imageUrl.includes('this.onerror')) {
            return imageUrl.replace(/&amp;/g, '&');
        }
    }
    return 'https://placehold.co/300x200/png';
}

export async function handleApiRequest(request, env) {
	try {
		const postsData = await getPosts(env);

		// Tambahkan properti 'featured_image' ke setiap post
		const processedData = postsData.map(post => {
			return {
				...post, // Salin semua properti asli post
				featured_image: getFirstImage(post.content) // Tambahkan properti baru
			};
		});

		const data = JSON.stringify(processedData, null, 2);
		return new Response(data, {
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
				'Access-Control-Allow-Origin': '*',
                'Cache-Control': 's-maxage=3600'
			},
		});
	} catch (error) {
		console.error('API Error:', error);
		const errorResponse = JSON.stringify({
            status: 'error',
            message: 'Gagal mengambil data dari sumber.',
            details: error.message
        });
		return new Response(errorResponse, {
			status: 500,
			headers: { 
                'Content-Type': 'application/json' 
            },
		});
	}
}