
import { AddStylesheet, FetchDocument } from "./util.js";

if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

// Map a script URL to its HTML module for getCurrentHtmlModule() to work.
const scriptUrlToModule = new Map();

// Utility function to parse the path from a URL
function GetPathFromURL(url)
{
	if (!url.length)
		return url;		// empty string
	
	const lastCh = url.charAt(url.length - 1);
	if (lastCh === "/" || lastCh === "\\")
		return url;		// already a path terminated by slash
	
	let last_slash = url.lastIndexOf("/");
	
	if (last_slash === -1)
		last_slash = url.lastIndexOf("\\");
	
	if (last_slash === -1)
		return "";			// neither slash found, assume no path (e.g. "file.ext" returns "" as path)
	
	return url.substr(0, last_slash + 1);
};

// Utility function to get the base URL of the current location
function GetBaseURL()
{
	return GetPathFromURL(location.origin + location.pathname);
};

// Utility functions to have promisified ways to add a classic (non-module) <script>.
function AddScript(url)
{
	return new Promise((resolve, reject) =>
	{
		const elem = document.createElement("script");
		elem.onload = resolve;
		elem.onerror = reject;
		elem.async = false;		// preserve execution order
		elem.src = url;
		document.head.appendChild(elem);
	});
}

// Check all children of parentElem for anything that looks like subresources that can be loaded, and
// return an array of them. NOTE: this is shallow, it won't check anything other than direct children.
function FindSubResourceElements(parentElem, htmlModule)
{
	const ret = [];
	
	for (let i = 0, len = parentElem.children.length; i < len; ++i)
	{
		const o = CheckForSubResourceElem(parentElem.children[i], htmlModule);
		
		if (o)
			ret.push(o);
	}
	
	return ret;
};

// Check if a given element is a subresource we can load.
function CheckForSubResourceElem(elem, htmlModule)
{
	const tagName = elem.tagName.toLowerCase();
	
	if (tagName === "link")
	{
		const rel = elem.getAttribute("rel").toLowerCase();
		const href = elem.getAttribute("href");

		// <link rel="stylesheet">: add a stylesheet subresource
		if (rel === "stylesheet")
		{
			return {
				type: "stylesheet",
				url: htmlModule.baseUrl + href
			};
		}
		// <link rel="html-module">: this is a made-up tag to load a sub-resource as a nested HTML module
		else if (rel === "html-module")
		{
			return {
				type: "html-module",
				url: htmlModule.baseUrl + href
			};
		}
	}
	else if (tagName === "script")
	{
		const src = elem.getAttribute("src");
		
		// <script src="...">: add a script subresource. Also supports module scripts.
		if (src)
		{
			// Map the full script src to its module object so getCurrentHtmlModule() can find the associated document and exports.
			const scriptUrl = htmlModule.baseUrl + src;
			scriptUrlToModule.set(new URL(scriptUrl, GetBaseURL()).toString(), htmlModule);

			return {
				type: "script",
				url: scriptUrl,
				isModule: (elem.getAttribute("type") === "module")
			};
		}
	}
	
	return null;
};

// Load a HTML Module from a URL.
async function LoadHTMLModule(url)
{
	const htmlModule = {
		document: null,						// document of the HTML page making up the HTML module
		baseUrl: GetPathFromURL(url),		// base URL to load subresources from
		exports: new Map()					// Map of tags to the default export for script modules in the HTML
	};
	
	// Load the URL as a HTML document.
	const doc = await FetchDocument(url);
	htmlModule.document = doc;
	
	// Look for any sub-resources of the HTML module: <link rel="stylesheet">, <script src="...">, and
	// a made-up <link rel="html-module"> to represent a sub-module.
	const subResources = [...FindSubResourceElements(doc.head, htmlModule),
						  ...FindSubResourceElements(doc.body, htmlModule)];
	
	// Load each subresource of the module.
	// NOTE: this is a naive implementation which sequentially loads resources one by one.
	// This should use some kind of parallel loading approach for a real production library.
	for (const { type, url, isModule } of subResources)
	{
		if (type === "script")
		{
			if (isModule)
			{
				// For module scripts, get the default export, and associate it by its tag in the exports
				// returned by the HTML module. If no tag is provided fall back to the script URL.
				const module = await import("./" + url);
				const tag = module.TAG || url;
				htmlModule.exports.set(tag, module.default);
			}
			else
			{
				// Classic scripts are simply added to the document.
				await AddScript(url);
			}
		}
		else if (type === "stylesheet")
		{
			await AddStylesheet(url);
		}
		else if (type === "html-module")
		{
			// Load the nested HTML module, and merge its exports with this one's. This lets the caller
			// access any nested script module exports. TODO: look for collisions with 'tag'.
			const { exports } = await LoadHTMLModule(url);
			
			for (const [tag, exp] of exports)
				htmlModule.exports.set(tag, exp);
		}
	}
	
	console.log("[HTML-Module] Loaded HTML module: " + url);
	return htmlModule;
};

// Add a global function for scripts to identify their associated HTML module, so they can find DOM elements
// they want to operate on, e.g. <dialog> elements, <template>, etc. as well as any other exports in the HTML module.
// In a module script the caller must pass import.meta.url; otherwise in a classic script it will automatically
// determine it from document.currentScript.
window.getCurrentHtmlModule = function (importMetaUrl)
{
	const importDoc = scriptUrlToModule.get(importMetaUrl || document.currentScript.src);

	if (importDoc)
	{
		return importDoc;
	}
	else
	{
		console.warn("[HTML-Module] Don't know which HTML module script belongs to: " + currentScriptSrc);
		return document;
	}
};

// The Symbol.importer method just calls in to LoadHTMLModule().
export default {
	async [Symbol.importer](url)
	{
		return await LoadHTMLModule(url);
	}
}
