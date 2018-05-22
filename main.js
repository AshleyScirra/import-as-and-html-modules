
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
	async string()
	{
		resultArea.innerText = await importAs("resources/text.txt", String);
	},
	async json()
	{
		const json = await importAs("resources/data.json", JSON);
		resultArea.innerText = JSON.stringify(json, null, 4);
	},
	async blob()
	{
		const blob = await importAs("resources/lenna.png", Blob);
		resultArea.innerText = `Loaded Blob size ${blob.size}, type '${blob.type}'`;
	},
	async arrayBuffer()
	{
		const arrayBuffer = await importAs("resources/lenna.png", ArrayBuffer);
		resultArea.innerText = `Loaded ArrayBuffer byteLength ${arrayBuffer.byteLength}`;
	},
	async image()
	{
		const imageElem = await importAs("resources/lenna.png", HTMLImageElement);
		resultArea.innerHTML = "";
		resultArea.appendChild(imageElem);
	},
	async imageBitmap()
	{
		const imageBitmap = await importAs("resources/lenna.png", ImageBitmap);
		resultArea.innerText = `Got ImageBitmap size ${imageBitmap.width} x ${imageBitmap.height}`;
	},
	async imageData()
	{
		const imageData = await importAs("resources/lenna.png", ImageData);
		resultArea.innerText = `Got ImageData size ${imageData.width} x ${imageData.height}, ${imageData.data.length} bytes`;
	},
	async canvas()
	{
		const canvas = await importAs("resources/lenna.png", Canvas2D);
		resultArea.innerHTML = "Image is on a 2D canvas:<br/>";
		resultArea.appendChild(canvas);
	},
	async document()
	{
		const doc = await importAs("resources/doc.html", Document);
		resultArea.innerHTML = "";
		resultArea.appendChild(doc.body);
	},
	async selector()
	{
		const elem = await importAs("resources/doc.html", Selector("#part2"));
		resultArea.innerHTML = "";
		resultArea.appendChild(elem);
	},
	async selectorAll()
	{
		const elems = await importAs("resources/doc.html", SelectorAll("div"));
		
		resultArea.innerHTML = "";
		
		for (const elem of elems)
			resultArea.appendChild(elem);
	},
	async style()
	{
		await importAs("resources/style.css", MainDocumentStyle)
		
		resultArea.innerText = "Style applied to main document";
	},
	async htmlModule()
	{
		// Load the HTML module
		const htmlModule = await importAs("html-modules/dialog1.html", HTMLModule);
		
		// Get Dialog1 from the module script in the HTML module
		const Dialog1 = htmlModule.exports.get("Dialog1");
		
		Dialog1.Show();
		
		resultArea.innerText = "Loaded HTML module, showing dialog1 from module";
	}
};
