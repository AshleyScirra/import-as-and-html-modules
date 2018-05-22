
const myModule = getCurrentHtmlModule(import.meta.url);
const myDoc = myModule.document;
const dialogElem = myDoc.getElementById("dialog2");

dialogElem.addEventListener("close", () =>
{
	myDoc.body.appendChild(dialogElem);
});

const closeButton = dialogElem.querySelector(".close");
closeButton.addEventListener("click", () => Dialog2.Hide());

export const TAG = "Dialog2";

export default class Dialog2
{
	static Show()
	{
		document.body.appendChild(dialogElem);
		dialogElem.showModal();
	}
	
	static Hide()
	{
		dialogElem.close();
	}
};
