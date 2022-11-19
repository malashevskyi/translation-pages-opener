chrome.runtime.onInstalled.addListener(() => {
  //receiving a message
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    console.log(
      sender.tab
        ? "from a content script:" + sender.tab.url
        : "from the extension"
    );
    if (request.greeting === "hello") sendResponse({ farewell: "goodbye" });
  });

  chrome.contextMenus.create({
    id: "context-menu-id",
    title: 'Translate: "%s"',
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const tabs = await new Promise((resolve) =>
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      resolve(tabs);
    })
  );

  const tabsToRemove = tabs
    .filter(
      (tab) =>
        tab.url.includes("https://dictionary.cambridge.org") ||
        tab.url.includes("https://translate.google.com") ||
        tab.url.includes("https://wooordhunt.ru") ||
        tab.url.includes("https://context.reverso.net")
    )
    .map((tab) => tab.id);

  await new Promise((resolve) =>
    chrome.tabs.remove(tabsToRemove, () => {
      resolve(true);
    })
  );

  const word = info.selectionText.trim().split(" ").join("-");
  chrome.tabs.create({
    url: `https://context.reverso.net/translation/english-ukrainian/${word}`,
  });
  chrome.tabs.create({
    url: `https://wooordhunt.ru/word/${word}`,
  });
  chrome.tabs.create({
    url: `https://translate.google.com/?hl=uk&sl=en&tl=uk&text=${word}&op=translate`,
  });
  chrome.tabs.create({
    url: `https://dictionary.cambridge.org/dictionary/english/${word}`,
  });
});
