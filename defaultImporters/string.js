
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

String[Symbol.importer] = async function ImportString(url)
{
	const response = await fetch(url);
	return await response.text();
};
