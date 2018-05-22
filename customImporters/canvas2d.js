
import { FetchImage } from "../util.js";

if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

export default {
	async [Symbol.importer](url)
	{
		// Load the URL as a normal image element.
		const imageElem = await FetchImage(url);
		
		// Once the image element is loaded, create a canvas the same size,
		// paste the image on to it, and return the canvas.
		const canvas = document.createElement("canvas");
		canvas.width = imageElem.width;
		canvas.height = imageElem.height;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(imageElem, 0, 0, imageElem.width, imageElem.height);
		return canvas;
	}
}
