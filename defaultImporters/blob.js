
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

Blob[Symbol.importer] = async function ImportBlob(url)
{
	const response = await fetch(url);
	return await response.blob();
};
