
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

ImageBitmap[Symbol.importer] = function ImportImageBitmap(url)
{
	// Fetch as blob and call createImageBitmap to return a promise that loads the ImageBitmap.
	return fetch(url)
	.then(response => response.blob())
	.then(createImageBitmap);
};
