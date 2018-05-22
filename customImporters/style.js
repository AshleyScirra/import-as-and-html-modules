
import { AddStylesheet } from "../util.js";

if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

export default {
	async [Symbol.importer](url)
	{
		await AddStylesheet(url);
	}
}
