
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

ImageData[Symbol.importer] = function ImportImageData(url)
{
	// First fetch as a normal <img> tag to load the ImageData from.
	return new Promise((resolve, reject) =>
	{
		const img = document.createElement("img");
		img.onload = (() => resolve(img));
		img.onerror = reject;
		img.src = url;
	})
	.then(img =>
	{
		// Once the image has loaded, create a canvas at the same size as the image
		// and paste the image on to it. Then use getImageData() to convert the
		// image content to an ImageData object.
		const canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, img.width, img.height);
		return ctx.getImageData(0, 0, img.width, img.height);
	});
};
