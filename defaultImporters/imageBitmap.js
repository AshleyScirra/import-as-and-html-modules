
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

ImageBitmap[Symbol.importer] = async function ImportImageBitmap(url)
{
	// Fetch as blob and call createImageBitmap to return a promise that loads the ImageBitmap.
	const response = await fetch(url);
	const blob = await response.blob();
	return await createImageBitmap(blob);
};
