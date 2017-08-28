# importAs() and HTML Modules
This repo contains a proof-of-concept of the "import as" or "generic imports" proposal. See [this comment thread](https://github.com/w3c/webcomponents/issues/645) for some background and context.

## Live demo
View a live demo with real running code at [ashleyscirra.github.io/import-as-and-html-modules/index.html](https://ashleyscirra.github.io/import-as-and-html-modules/index.html). **Note this requires a browser with Modules support, e.g. Chrome 61+.** All the code is in this repo so you can see how it is implemented.

## Intent
The intent of this proposal is to ultimately allow something like this:

```js
import doc from './my-html-module.html' as HTMLModule;
```

This could act as a complete replacement of HTML imports, leveraging the JavaScript module system rather than having a parallel dependency system for imports. Additionally, this allows the entire implementation of HTML Modules to be written in a JavaScript library. This avoids the need to actually write a specification for HTML Modules, and is future-proof for other kinds of imports that may be invented later.

There are a few tricky aspects of supporting the above syntax. In particular `import` statements are designed to be statically analysable, but calling in to a library function like `HTMLModule` requires adding dynamic features to imports. To avoid having to solve this, the proof-of-concept is implemented only in the style of [dynamic import()](https://github.com/tc39/proposal-dynamic-import). To avoid conflicting with `import()`, the proof-of-concept uses a method named `importAs()`, but the intent is that these features could work with `import()` too, and ultimately static imports as well.

## How it works
The feature is very simple. It starts with a call to:

```js
importAs(url, Type);
```

This will call `Type[Symbol.importer](url)` which returns a Promise. There could be built-in importers for e.g. `JSON` (included in the example). However it is also fully extensible by JavaScript libraries, which can provide their own types with `Symbol.importer`. This provides a hook to implement HTML Modules entirely by a library.

`importAs(url)` with no type ought to fall back to `import()` but no browsers currently implement this so it was omitted from the proof-of-concept code.

## Use cases
You can use the import system to load static resources. This means the import system can be used to load *all* your resources, in whichever format you want them, rather than being limited to other JS modules only. Examples:

```js
importAs("file.txt", String).then(str => ... );
importAs("file.json", JSON).then(json => ... );
importAs("file.dat", Blob).then(blob => ... );
importAs("file.dat", ArrayBuffer).then(arrayBuffer => ... );
importAs("file.png", HTMLImageElement).then(img => ... );
importAs("file.png", ImageBitmap).then(imageBitmap => ... );
importAs("file.png", ImageData).then(imageData => ... );
```

Many of these will work in a Worker too, but the DOM-based ones (e.g. HTMLImageElement) can't.

You can also load static documents to access other snippets of DOM. The library-implemented `Selector` and `SelectorAll` importers make this convenient to use.

```js
importAs("file.html", Document).then(doc => ...);
importAs("file.html", Selector("#templateElem")).then(templateElem => ...);
importAs("file.html", SelectorAll(".item")).then(itemElems => ...);
```

This is intended to take advantage of existing de-duplication mechanisms in the module system. In the above example, only one request to `file.html` ought to be made, since the subsequent requests will be de-duplicated and return the same resource. This makes it efficient to load a variety of elements from the same document with the `Selector` and `SelectorAll` importers.

A library-implemented `MainDocumentStyle` also allows applying main document styles. This was recently dropped from HTML imports in Chrome, but shows how the feature can be easily adapted to cover styling too, which is also used in the HTML Modules implementation.

```js
importAs("file.css", MainDocumentStyle).then(() => /* style was applied */);
```

## HTML Modules
This repo provides a proof-of-concept `HTMLModule` importer which allows:

```js
importAs("file.html", HTMLModule).then(doc => ...);
```

HTML Modules are implemented similarly to HTML imports. The implementation does the following:

- loads "file.html" as a document
- looks for `<link rel="stylesheet">` elements and applies them to the main document style
- looks for `<script src="...">` and loads and executes them (note these have to be classic scripts at the moment)
- provides a `getCurrentHtmlModule()` global function for scripts to identify their associated HTML document, allowing them to access DOM elements from it
- looks for a made-up `<link rel="html-module">` which represents a sub-module, allowing for nested HTML module dependencies
- resolves the promise when all sub-resources have finished loading

HTML imports are an excellent way to modularise large web apps. JavaScript modules only cover script, but HTML imports can load style, markup and script, all of which are important in a web app. For more background see the blog post [HTML imports are the best web component](https://www.scirra.com/blog/ashley/34/html-imports-are-the-best-web-component). HTML modules are designed to bring the same benefits with a library-based implementation. To demonstrate the benefit of this, the demo loads an import representing a dialog and shows it. Note how the dialog is implemented:

- The dialog markup, style and script are all entirely self-contained, making it an independent module.
- The script can access DOM content with `getCurrentHtmlModule()`, so it can find its `<dialog>` tag and call `showModal()` on it. There are many other use cases here, particularly loading a `<template>`.
- The style is applied to the main document, so it affects the dialog when it is displayed. The style is of course global, but it is very easy to scope all its styles to the dialog by using its ID selector. This helps make CSS maintainable.
- It includes a sub-dialog it depends on using `<link rel="html-module" href="dialog2/dialog2.html">`. Since order-of-execution is guaranteed, the first dialog can safely use `Dialog2.Show()`, defined in the sub-module.

The goal is to demonstrate how this forms the basis of a reliable and scalable way to architect large and complex web apps. The use of combined markup, style and script resources is an important advantage over JavaScript Modules alone. Additionally, hopefully the small API surface, simplicity of the code, and flexiblity of the feature add up to a compelling feature.

## Missing features
- No static import
- Only classic scripts are supported in the proof-of-concept HTMLModule, because `getCurrentHtmlModule()` currently depends on `document.currentScript` which is not set for modules. Obviously this is a desirable feature; the [import.meta](https://github.com/tc39/proposal-import-meta) proposal should provide a way to support modules.
- The HTMLModule implementation loads sequentially, since it's just a proof-of-concept. Obviously a production library would parallelise loading for maximum performance. Additionally real-world apps would likely concatenate HTML Modules down in to fewer resources, much as [vulcanize](https://www.npmjs.com/package/vulcanize) does for HTML imports.
- There is currently no way for the `importAs("file.html", HTMLModule)` call to resolve with anything other than the Document of `file.html`. Ideally there would be a way to specify a set of exports. For example in the demo, Dialog1 adds a global `Dialog1.Show()` function. Ideally the dialog script could say something like `export Dialog1`, which could then end up exposed to the promise, e.g. `importAs("file.html", HTMLModule).then(result => result.exports.Dialog1.Show())`. This avoids the need to use the global namespace to expose new methods.

## An alternative approach
The dialog could also be imported as a normal JS module, and load its DOM and style like this:

```js
Promise.all([
	importAs("dialog1.html", Selector("#dialog1")),
	importAs("dialog1.css", MainDocumentStyle)
])
```

or if the static import is supported:

```js
import dialogElem from "./dialog1.html" as Selector("#dialog1");
import "./dialog1.css" as MainDocumentStyle;
```

This solves a couple of problems with the HTML Modules approach, particularly that it's easy for the dialog to export its own functions, but could be trickier for a build system to concatenate. It would also require the static imports syntax to be supported for it to easily be able to export a function that calls `dialogElem.showModal()`, since it depends on `dialog.html` having finished loading, and exports must be statically declared.

If the HTML Modules implementation lives in a JS library, the specification doesn't need to care which approach you take: they can both be done under this same proposal and it's up to the developer how they approach this.
