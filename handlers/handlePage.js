// template/handlers/handlePage.js

import { getPosts } from './handlePosts.js'; // Impor fungsi getPosts
import { renderTemplate } from '../utils/renderer.js';
import layout from '../templates/layout.html';
import pageTemplate from '../templates/page.html';
import settings from '../data/settings.json';
import { generateMobileMenu, generateFooterMenu } from '../utils/menu.js';

/**
 * Handler utama untuk merender halaman statis (misalnya /about, /contact).
 * @param {string} slug - Slug halaman yang diminta (misalnya "about").
 * @param {object} env - Variabel lingkungan Cloudflare.
 */
export async function handlePageRequest(slug, env) {
	try {
		// Anda tetap bisa mengambil data posts jika diperlukan untuk konteks halaman,
		// misalnya untuk menampilkan daftar post terbaru di sidebar.
		// const postsData = await getPosts(env);

		let pageTitle = 'Halaman Tidak Ditemukan';
		let pageContent = '<h1>404 - Halaman Tidak Ditemukan</h1><p>Maaf, halaman yang Anda cari tidak ada.</p>';
		let responseStatus = 404;

		// Logika sederhana untuk merender halaman berdasarkan slug
		if (slug === 'about') {
			pageTitle = 'Tentang Kami';
			pageContent = '<h1>Tentang Kami</h1><p>Ini adalah halaman tentang situs web ini.</p>';
			responseStatus = 200;
		} else if (slug === 'contact') {
            pageTitle = 'Kontak';
			pageContent = '<h1>Hubungi Kami</h1><p>Anda bisa menghubungi kami melalui email di admin@example.com.</p>';
			responseStatus = 200;
        }

		// Render konten utama halaman
		const renderedPage = await renderTemplate(pageTemplate, {
			PAGE_CONTENT: pageContent,
		});

		// Render layout lengkap dengan konten halaman di dalamnya
		const finalHtml = await renderTemplate(layout, {
			SEO_TITLE: `${pageTitle} | ${settings.siteTitle}`,
			PAGE_CONTENT: renderedPage,
			SITE_TITLE: settings.siteTitle,
			MOBILE_MENU_LINKS: generateMobileMenu(),
			FOOTER_MENU_LINKS: generateFooterMenu(),
            JSON_LD_SCRIPT: ''
		});

		return new Response(finalHtml, {
			status: responseStatus,
			headers: { 'Content-Type': 'text/html;charset=UTF-8' },
		});

	} catch (error) {
		console.error(`Page Error for slug "${slug}":`, error);
		return new Response('Terjadi kesalahan internal saat memuat halaman.', { status: 500 });
	}
}