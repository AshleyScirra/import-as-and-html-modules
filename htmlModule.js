
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

// Map a script URL to its HTML module document for getCurrentHtmlModule() to work.
const scriptUrlToModuleDoc = new Map();

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

// Utility functions to have promisified ways to add <script> and <link rel="stylesheet"> tags to <head>
function AddScript(url, isModule)
{
	return new Promise((resolve, reject) =>
	{
		const elem = document.createElement("script");
		elem.onload = resolve;
		elem.onerror = reject;
		elem.async = false;		// preserve execution order
		if (isModule)
			elem.type = "module";
		elem.src = url;
		document.head.appendChild(elem);
	});
}

function AddStylesheet(url)
{
	return new Promise((resolve, reject) =>
	{
		const elem = document.createElement("link");
		elem.onload = resolve;
		elem.onerror = reject;
		elem.rel = "stylesheet";
		elem.href = url;
		document.head.appendChild(elem);
	});
}

// Utility function to fetch a URL as type document. fetch() can't do document type yet, so use XHR.
function FetchDocument(url)
{
	return new Promise((resolve, reject) =>
	{
		const xhr = new XMLHttpRequest();
		xhr.onload = (() =>
		{
			if (xhr.status >= 200 && xhr.status < 300)
			{
				resolve(xhr.response);
			}
			else
			{
				reject(new Error("Failed to fetch '" + url + "': " + xhr.status + " " + xhr.statusText));
			}
		});
		xhr.onerror = reject;

		xhr.open("GET", url);
		xhr.responseType = "document";
		xhr.send();
	});
};

// Check all children of parentElem for anything that looks like subresources that can be loaded, and
// return an array of them. NOTE: this is shallow, it won't check anything other than direct children.
function FindSubResourceElements(parentElem, context)
{
	const ret = [];
	
	for (let i = 0, len = parentElem.children.length; i < len; ++i)
	{
		const o = CheckForSubResourceElem(parentElem.children[i], context);
		
		if (o)
			ret.push(o);
	}
	
	return ret;
};

// Check if a given element is a subresource we can load.
function CheckForSubResourceElem(elem, context)
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
				url: context.baseUrl + href
			};
		}
		// <link rel="html-module">: this is a made-up tag to load a sub-resource as a nested HTML module
		else if (rel === "html-module")
		{
			return {
				type: "html-module",
				url: context.baseUrl + href
			};
		}
	}
	else if (tagName === "script")
	{
		const src = elem.getAttribute("src");
		
		// <script src="...">: add a script subresource. NOTE: currently this only works with classic scripts,
		// because getCurrentHtmlModule() depends on document.currentScript, which is not set in modules.
		if (src)
		{
			// Map the full script src to its module document so getCurrentHtmlModule() can find the associated document.
			const scriptUrl = context.baseUrl + src;
			scriptUrlToModuleDoc.set(new URL(scriptUrl, GetBaseURL()).toString(), context.doc);

			return {
				type: "script",
				url: scriptUrl
			};
		}
	}
	
	return null;
};

// Load a HTML Module from a URL.
async function LoadHTMLModule(url)
{
	const context = {
		doc: null,							// document of the HTML page making up the HTML module
		baseUrl: GetPathFromURL(url)		// base URL to load subresources from
	};
	
	// Load the URL as a HTML document.
	const doc = await FetchDocument(url);
	context.doc = doc;
	
	// Look for any sub-resources of the HTML module: <link rel="stylesheet">, <script src="...">, and
	// a made-up <link rel="html-module"> to represent a sub-module.
	const subResources = [...FindSubResourceElements(doc.head, context),
						  ...FindSubResourceElements(doc.body, context)];
	
	// Load each subresource of the module.
	// NOTE: this is a naive implementation which sequentially loads resources one by one.
	// This should use some kind of parallel loading approach for a real production library.
	for (const {type, url} of subResources)
	{
		if (type === "script")
			await AddScript(url);
		else if (type === "stylesheet")
			await AddStylesheet(url);
		else if (type === "html-module")
			await LoadHTMLModule(url);
	}
	
	console.log("[HTML-Module] Loaded HTML module: " + url);
	return doc;
};

// Add a global function for scripts to identify their associated HTML module, so they can find DOM elements
// they want to operate on, e.g. <dialog> elements, <template>, etc.
// NOTE: this depends on document.currentScript, which is unavailable in modules, so this currently only works
// with classic scripts.
window.getCurrentHtmlModule = function()
{
	const currentScriptSrc = document.currentScript.src;
	const importDoc = scriptUrlToModuleDoc.get(currentScriptSrc);

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
	[Symbol.importer](url)
	{
		return LoadHTMLModule(url);
	}
}
