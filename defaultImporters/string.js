
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

String[Symbol.importer] = function ImportString(url)
{
	return fetch(url)
	.then(response => response.text());
};
