
// Polyfill
import importAs from "./importAs.js";

// 'Default' importers (things the browser could provide as built-ins)
import "./defaultImporters/all.js";

// Custom importers (things implemented in a JS library)
import Canvas2D from "./customImporters/canvas2d.js";
import Selector from "./customImporters/selector.js";
import SelectorAll from "./customImporters/selectorAll.js";
import MainDocumentStyle from "./customImporters/style.js";
import HTMLModule from "./htmlModule.js";

// DOM elements for the demo
const importTypeSelect = document.getElementById("importType");
const loadButton = document.getElementById("load");
const resultArea = document.getElementById("resultArea");

// When clicking the 'Load' button, run one of the functions below
loadButton.addEventListener("click", () =>
{
	importFuncs[importTypeSelect.value]();
});

// Set of importAs() demo functions, corresponding to importTypeSelect.value
const importFuncs = {
	string()
	{
		importAs("resources/text.txt", String)
		.then(text =>
		{
			resultArea.innerText = text;
		});
	},
	json()
	{
		importAs("resources/data.json", JSON)
		.then(json =>
		{
			resultArea.innerText = JSON.stringify(json, null, 4);
		});
	},
	blob()
	{
		importAs("resources/lenna.png", Blob)
		.then(blob =>
		{
			resultArea.innerText = `Loaded Blob size ${blob.size}, type '${blob.type}'`;
		});
	},
	arrayBuffer()
	{
		importAs("resources/lenna.png", ArrayBuffer)
		.then(arrayBuffer =>
		{
			resultArea.innerText = `Loaded ArrayBuffer byteLength ${arrayBuffer.byteLength}`;
		});
	},
	image()
	{
		importAs("resources/lenna.png", HTMLImageElement)
		.then(img =>
		{
			resultArea.innerHTML = "";
			resultArea.appendChild(img);
		});
	},
	imageBitmap()
	{
		importAs("resources/lenna.png", ImageBitmap)
		.then(imageBitmap =>
		{
			resultArea.innerText = `Got ImageBitmap size ${imageBitmap.width} x ${imageBitmap.height}`;
		});
	},
	imageData()
	{
		importAs("resources/lenna.png", ImageData)
		.then(imageData =>
		{
			resultArea.innerText = `Got ImageData size ${imageData.width} x ${imageData.height}, ${imageData.data.length} bytes`;
		});
	},
	canvas()
	{
		importAs("resources/lenna.png", Canvas2D)
		.then(img =>
		{
			resultArea.innerHTML = "Image is on a 2D canvas:<br/>";
			resultArea.appendChild(img);
		});
	},
	document()
	{
		importAs("resources/doc.html", Document)
		.then(doc =>
		{
			resultArea.innerHTML = "";
			resultArea.appendChild(doc.body);
		});
	},
	selector()
	{
		importAs("resources/doc.html", Selector("#part2"))
		.then(elem =>
		{
			resultArea.innerHTML = "";
			resultArea.appendChild(elem);
		});
	},
	selectorAll()
	{
		importAs("resources/doc.html", SelectorAll("div"))
		.then(elems =>
		{
			resultArea.innerHTML = "";
			
			for (const elem of elems)
				resultArea.appendChild(elem);
		});
	},
	style()
	{
		importAs("resources/style.css", MainDocumentStyle)
		.then(link =>
		{
			resultArea.innerText = "Style applied to main document";
		});
	},
	htmlModule()
	{
		importAs("html-modules/dialog1.html", HTMLModule)
		.then(htmlModule =>
		{
			resultArea.innerText = "Loaded HTML module, showing dialog1 from module";
			
			window.Dialog1.Show();
		});
	}
};
