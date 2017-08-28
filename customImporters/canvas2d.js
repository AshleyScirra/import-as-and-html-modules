
if (!Symbol.importer)
	throw new Error("Symbol.importer not defined");

export default {
	[Symbol.importer](url)
	{
		// Load the URL as a normal image element.
		return new Promise((resolve, reject) =>
		{
			const img = document.createElement("img");
			img.onload = (() => resolve(img));
			img.onerror = reject;
			img.src = url;
		})
		.then(img =>
		{
			// Once the image element is loaded, create a canvas the same size,
			// paste the image on to it, and return the canvas.
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, img.width, img.height);
			return canvas;
		});
	}
}
