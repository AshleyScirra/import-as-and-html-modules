
"use strict";
{
	// Determine associated HTML module using global method getCurrentHtmlModule().
	// This lets us access DOM elements like the <dialog> we are interested in.
	const myDoc = getCurrentHtmlModule();
	const dialogElem = myDoc.getElementById("dialog1");
	
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
	
	// Add some global methods for handling the dialog. TODO: figure out a better
	// way to export this from the HTML module.
	window.Dialog1 = {
		Show()
		{
			// Dialogs can't be shown unless they are in the main document, so transfer
			// the <dialog> tag to the main document before calling showModal().
			// It's transferred back in the "close" event.
			document.body.appendChild(dialogElem);
			dialogElem.showModal();
		},
		Hide()
		{
			dialogElem.close();
		}
	};
}
