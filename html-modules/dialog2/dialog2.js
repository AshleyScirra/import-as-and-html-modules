
"use strict";
{
	const myDoc = getCurrentHtmlModule();
	const dialogElem = myDoc.getElementById("dialog2");
	
	dialogElem.addEventListener("close", () =>
	{
		myDoc.body.appendChild(dialogElem);
	});
	
	const closeButton = dialogElem.querySelector(".close");
	closeButton.addEventListener("click", () => Dialog2.Hide());
	
	window.Dialog2 = {
		Show()
		{
			document.body.appendChild(dialogElem);
			dialogElem.showModal();
		},
		Hide()
		{
			dialogElem.close();
		}
	};
}
