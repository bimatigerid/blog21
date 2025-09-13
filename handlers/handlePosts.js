// template/handlers/handlePosts.js

import settings from '../data/settings.json';
import layout from '../templates/layout.html';
import postsTemplate from '../templates/posts.html';
import singleTemplate from '../templates/single.html';
import { renderTemplate } from '../utils/renderer.js';
import { generateMeta } from '../utils/seo.js';
import { generateMobileMenu, generateFooterMenu } from '../utils/menu.js';

let postsCache = null;

export async function getPosts(env) {
	if (postsCache) {
		return postsCache;
	}
	const githubUser = env.GITHUB_USERNAME;
	const repoName = env.REPO_NAME;
	if (!githubUser || !repoName) {
		throw new Error('Secrets GITHUB_USERNAME dan REPO_NAME belum diatur di Cloudflare.');
	}
	const POSTS_URL = `https://raw.githubusercontent.com/${githubUser}/${repoName}/main/public/data/posts.json`;
	console.log(`Mengambil data dari: ${POSTS_URL}`);
	const response = await fetch(POSTS_URL);
	if (!response.ok) {
		throw new Error(`Gagal mengambil data posts dari GitHub. Status: ${response.status}`);
	}
	const data = await response.json();
	postsCache = data;
	return data;
}

/**
 * FUNGSI PENCARI GAMBAR YANG DISEMPURNAKAN
 * Mencari semua tag <img> dan mengembalikan src dari gambar pertama yang valid.
 * @param {string} htmlContent - Konten HTML dari post.
 * @returns {string} - URL gambar atau URL placeholder.
 */
function getFirstImage(htmlContent) {
    if (!htmlContent) return 'https://placehold.co/300x200/png';

    // Regex ini akan menemukan semua tag <img> dan mengambil isi dari atribut src
    const regex = /<img[^>]+src="([^"]+)"/g;
    const matches = [...htmlContent.matchAll(regex)];

    // Iterasi melalui semua gambar yang ditemukan
    for (const match of matches) {
        const imageUrl = match[1];
        // Pastikan URL valid dan bukan gambar placeholder yang rusak
        if (imageUrl && !imageUrl.includes('this.onerror')) {
            // Mengganti &amp; menjadi & agar URL valid
            return imageUrl.replace(/&amp;/g, '&');
        }
    }

    // Jika tidak ada gambar yang ditemukan, kembalikan placeholder
    return 'https://placehold.co/300x200/png';
}

async function showPostList(env) {
	const postsData = await getPosts(env);
	const initialPosts = postsData.slice(0, 8); // Ambil 8 post pertama

	const postsHtml = initialPosts
		.map((post) => {
			const cleanedTitle = cleanTitle(post.title);
			const firstImage = getFirstImage(post.content);
			return `<div class="post-item"><a href="/${post.slug}"><img src="${firstImage}" alt="${cleanedTitle}" loading="lazy"><h3>${cleanedTitle}</h3></a></div>`;
		})
		.join('');

	const pageContent = await renderTemplate(postsTemplate, { POST_LIST: postsHtml });
	const meta = generateMeta({ title: settings.siteTitle, description: settings.siteDescription });

	const finalHtml = await renderTemplate(layout, {
		SEO_TITLE: meta.title,
		PAGE_CONTENT: pageContent,
		SITE_TITLE: settings.siteTitle,
		MOBILE_MENU_LINKS: generateMobileMenu(),
		FOOTER_MENU_LINKS: generateFooterMenu(),
		JSON_LD_SCRIPT: '',
	});

	return new Response(finalHtml, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

async function showSinglePost(slug, env) {
	const postsData = await getPosts(env);
	const post = postsData.find((p) => p.slug === slug);
	if (!post) return new Response('Postingan tidak ditemukan', { status: 404 });

	const cleanedTitle = cleanTitle(post.title);
	const mainContent = getMainContent(post.content);

	const pageContent = await renderTemplate(singleTemplate, {
		POST_TITLE: cleanedTitle,
		POST_CONTENT: mainContent,
		RELATED_POSTS: getRelatedPosts(slug, postsData),
	});

	const metaPost = { ...post, title: cleanedTitle };
	const meta = generateMeta(metaPost);

	const finalHtml = await renderTemplate(layout, {
		SEO_TITLE: meta.title,
		PAGE_CONTENT: pageContent,
		SITE_TITLE: settings.siteTitle,
		MOBILE_MENU_LINKS: generateMobileMenu(),
		FOOTER_MENU_LINKS: generateFooterMenu(),
		JSON_LD_SCRIPT: post.json_ld || '',
	});

	return new Response(finalHtml, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

export async function handlePostsRequest(request, env) {
	const url = new URL(request.url);
	const path = url.pathname;

	if (path === '/' || path === '') {
		return await showPostList(env);
	}
	const pathParts = path.split('/').filter((part) => part.length > 0);
	if (pathParts.length === 1) {
		return await showSinglePost(pathParts[0], env);
	}
	return new Response('Halaman tidak ditemukan', { status: 404 });
}

// --- FUNGSI-FUNGSI HELPER ---
function cleanTitle(title) {
	if (!title) return '';
	const cutoffIndex = title.indexOf('');
	if (cutoffIndex !== -1) return title.substring(0, cutoffIndex).trim();
	const separators = [' | ', ' – '];
	for (const sep of separators) {
		if (title.includes(sep)) return title.split(sep)[0].trim();
	}
	return title;
}
function getMainContent(htmlContent) {
	if (!htmlContent) return '';
	const searchTag = 'If you are searching about';
	const searchIndex = htmlContent.indexOf(searchTag);
	if (searchIndex !== -1) return htmlContent.substring(0, searchIndex);
	return htmlContent;
}
function getRelatedPosts(currentSlug, allPosts) {
	const related = allPosts.filter(p => p.slug !== currentSlug);
	const shuffled = related.sort(() => 0.5 - Math.random());
	return shuffled.slice(0, 5).map(post => {
        if (post && post.slug) return `<li><a href="/${post.slug}">${cleanTitle(post.title)}</a></li>`;
        return '';
    }).join('');
}