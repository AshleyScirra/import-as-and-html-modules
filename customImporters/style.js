
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

export default {
	[Symbol.importer](url)
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
}
