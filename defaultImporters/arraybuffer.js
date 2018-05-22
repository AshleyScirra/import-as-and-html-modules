
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

ArrayBuffer[Symbol.importer] = async function ImportArrayBuffer(url)
{
	const response = await fetch(url);
	return await response.arrayBuffer();
};
