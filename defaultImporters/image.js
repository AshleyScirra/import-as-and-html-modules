
import { FetchImage } from "../util.js";

if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

HTMLImageElement[Symbol.importer] = async function ImportImage(url)
{
	return await FetchImage(url);
};
