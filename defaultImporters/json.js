
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

JSON[Symbol.importer] = async function ImportJSON(url)
{
	const response = await fetch(url);
	return await response.json();
};
