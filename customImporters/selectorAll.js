
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

export default function SelectorAll(sel)
{
	return {
		[Symbol.importer](url)
		{
			// Load the URL as a document using XHR (since fetch() doesn't do document type yet).
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
			})
			.then(doc =>
			{
				// Once we have a document, return the result of querying the given selector on it and return all matches.
				return doc.querySelectorAll(sel);
			});
		}
	};
}
