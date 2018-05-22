
export function FetchImage(url)
{
	return new Promise((resolve, reject) =>
	{
		const img = document.createElement("img");
		img.onload = (() => resolve(img));
		img.onerror = reject;
		img.src = url;
	});
}

export function FetchDocument(url)
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
	});
}

export function AddStylesheet(url)
{
	// Simply promisify adding a <link rel="stylesheet"> element to the main document <head> tag.
	return new Promise((resolve, reject) =>
	{
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.onload = (() => resolve(link));
		link.onerror = reject;
		link.href = url;
		document.head.appendChild(link);
	});
}