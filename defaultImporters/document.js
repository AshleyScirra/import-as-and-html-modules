
import { FetchDocument } from "../util.js";

if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

Document[Symbol.importer] = async function ImportDocument(url)
{
	return await FetchDocument(url);
};
