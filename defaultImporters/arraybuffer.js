
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

ArrayBuffer[Symbol.importer] = function ImportArrayBuffer(url)
{
	return fetch(url)
	.then(response => response.arrayBuffer());
};
