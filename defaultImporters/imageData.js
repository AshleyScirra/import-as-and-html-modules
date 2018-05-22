
import { FetchImage } from "../util.js";

if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

ImageData[Symbol.importer] = async function ImportImageData(url)
{
	const imageElem = await FetchImage(url);
	
	// Once the image has loaded, create a canvas at the same size as the image
	// and paste the image on to it. Then use getImageData() to convert the
	// image content to an ImageData object.
	const w = imageElem.width;
	const h = imageElem.height;
	
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	ctx.drawImage(imageElem, 0, 0, w, h);
	return ctx.getImageData(0, 0, w, h);
};
