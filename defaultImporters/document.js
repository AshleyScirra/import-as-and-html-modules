
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

Document[Symbol.importer] = function ImportDocument(url)
{
	return new Promise((resolve, reject) =>
	{
		// Fetch as type "document". This returns a Document class, not DocumentFragment, so the importer
		// is named and applied accordingly. Use XHR since fetch() doesn't do documents yet.
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
