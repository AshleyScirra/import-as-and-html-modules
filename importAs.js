
if (Symbol.importer)
	throw new Error("Symbol.importer is already defined");

Symbol.importer = Symbol();

export default function importAs(url, type)
{
	// No importer: fall back to standard script module import()
	if (typeof type === "undefined")
	{
		//return import(url);
		throw new Error("TODO: fall back to import() when supported");
	}
	
	// Look for the importer function on the type
	const importer = type[Symbol.importer];
	if (typeof importer !== "function")
		throw new Error("importAs type has no Symbol.importer function");
	
	// Call the importer to do the importing
	return importer(url);
};