// template/handlers/handleSitemap.js

import { getPosts } from './handlePosts.js'; // Import the centralized getPosts function
import settings from '../data/settings.json';

/**
 * Handler to generate the sitemap.xml file dynamically.
 * @param {Request} request - The incoming request object.
 * @param {object} env - Cloudflare environment variables.
 */
export async function handleSitemapRequest(request, env) {
	try {
		// 1. Fetch the posts data from GitHub
		const postsData = await getPosts(env);
		
		// 2. Get the base URL of the site from settings or the request URL
		const siteUrl = settings.siteUrl || new URL(request.url).origin;

		// 3. Start building the XML string
		let xml = '<?xml version="1.0" encoding="UTF-8"?>';
		xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

		// 4. Add the URL for the homepage
		xml += `<url><loc>${siteUrl}/</loc></url>`;

		// 5. Add a URL for each post from the fetched data
		postsData.forEach((post) => {
			// Ensure the slug is valid before adding
			if (post && post.slug) {
				xml += `<url><loc>${siteUrl}/${post.slug}</loc></url>`;
			}
		});

		xml += '</urlset>';

		// 6. Return the complete XML as the response
		return new Response(xml, {
			headers: {
				'Content-Type': 'application/xml;charset=UTF-8',
				'Cache-Control': 'max-age=3600', // Cache the sitemap for 1 hour
			},
		});

	} catch (error) {
		console.error('Sitemap Error:', error);
		return new Response('Could not generate sitemap.', { status: 500 });
	}
}