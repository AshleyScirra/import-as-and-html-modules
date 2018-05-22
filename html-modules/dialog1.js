
// Determine associated HTML module using global method getCurrentHtmlModule().
// This lets us access DOM elements like the <dialog> we are interested in.
const myModule = getCurrentHtmlModule(import.meta.url);
const myDoc = myModule.document;
const dialogElem = myDoc.getElementById("dialog1");
const Dialog2 = myModule.exports.get("Dialog2");

// When the dialog is closed, append it back to the original document. This
// removes it from the main document so it does not clutter up its DOM.
dialogElem.addEventListener("close", () =>
{
	myDoc.body.appendChild(dialogElem);
});

// Handle open and close buttons.
const closeButton = dialogElem.querySelector(".close");
closeButton.addEventListener("click", () => Dialog1.Hide());

const dialog2Button = dialogElem.querySelector(".dialog2");
dialog2Button.addEventListener("click", () => Dialog2.Show());

// Export a tag for the default exported class, so we know what to call it.
export const TAG = "Dialog1";

// Export the dialog class with some methods to hide and show it.
export default class Dialog1
{
	static Show()
	{
		// Dialogs can't be shown unless they are in the main document, so transfer
		// the <dialog> tag to the main document before calling showModal().
		// It's transferred back in the "close" event.
		document.body.appendChild(dialogElem);
		dialogElem.showModal();
	}
	
	static Hide()
	{
		dialogElem.close();
	}
};
