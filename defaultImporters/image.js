
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

HTMLImageElement[Symbol.importer] = function ImportImage(url)
{
	// Simply promisify loading an <img> tag.
	return new Promise((resolve, reject) =>
	{
		const img = document.createElement("img");
		img.onload = (() => resolve(img));
		img.onerror = reject;
		img.src = url;
	});
};
