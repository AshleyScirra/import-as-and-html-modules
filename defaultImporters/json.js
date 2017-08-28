
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

JSON[Symbol.importer] = function ImportJSON(url)
{
	return fetch(url)
	.then(response => response.json());
};
