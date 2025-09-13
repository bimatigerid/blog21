// template/utils/seo.js

import settings from '../data/settings.json';

/**
 * Membuat deskripsi singkat (excerpt) dari konten.
 * VERSI INI SUDAH DIPERBAIKI: Menjadi lebih aman dan tahan banting.
 * @param {string} content - Konten HTML atau teks biasa.
 * @returns {string} - Teks singkat (155 karakter) tanpa HTML.
 */
function createExcerpt(content) {
	// 1. Periksa jika konten tidak ada (null atau undefined), kembalikan deskripsi default.
	if (!content) {
		return settings.siteDescription || 'Tidak ada deskripsi.';
	}

	// 2. Hapus semua tag HTML dari konten.
	const textOnly = content.replace(/<[^>]*>/g, '');

	// 3. Potong teks menjadi 155 karakter dan tambahkan "..."
	if (textOnly.length > 155) {
		return textOnly.substring(0, 155) + '...';
	}

	return textOnly;
}

/**
 * Menghasilkan objek meta tag (title dan description) untuk SEO.
 * @param {object} post - Objek post atau halaman.
 * @returns {object} - Objek berisi { title, description }.
 */
export function generateMeta(post = {}) {
	const siteTitle = settings.siteTitle || 'Judul Situs Default';

	// Jika ini adalah halaman post tunggal (memiliki slug)
	if (post.slug) {
		const postTitle = post.title || 'Tanpa Judul';
		// Gunakan konten post untuk membuat excerpt, jika ada.
		const postDescription = createExcerpt(post.content);
		return {
			title: `${postTitle} | ${siteTitle}`,
			description: postDescription,
		};
	}

	// Jika ini adalah halaman utama atau halaman lain
	// Gunakan deskripsi default dari settings.json
	const siteDescription = settings.siteDescription || 'Selamat datang di situs kami.';
	return {
		title: siteTitle,
		description: siteDescription,
	};
}