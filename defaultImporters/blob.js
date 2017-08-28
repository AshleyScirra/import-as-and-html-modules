
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

Blob[Symbol.importer] = function ImportBlob(url)
{
	return fetch(url)
	.then(response => response.blob());
};
