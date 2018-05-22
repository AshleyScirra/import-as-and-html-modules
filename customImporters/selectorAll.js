
import { FetchDocument } from "../util.js";

if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

export default function SelectorAll(sel)
{
	return {
		async [Symbol.importer](url)
		{
			// Fetch the URL as a document
			const doc = await FetchDocument(url);
			
			// Once we have a document, return the result of querying the given selector on it and return all matches.
			return doc.querySelectorAll(sel);
		}
	};
}
