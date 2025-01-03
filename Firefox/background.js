browser.browserAction.onClicked.addListener(sortTabsByXPath);

async function sortTabsByXPath() {
  async function createListEntry(tabId) {
    const results = await browser.tabs.executeScript(tabId, {
      file: "content-script.js"
    });

    const value = results[0] || { xpathValue: 9999999 };
    return { tabId: tabId, xpathValue: value.xpathValue };
  }

  const tabs = await browser.tabs.query({ currentWindow: true });
  let promiseList = tabs.map(tab => createListEntry(tab.id));

  const sortedList = (await Promise.all(promiseList)).sort((a, b) => {
    return a.xpathValue - b.xpathValue;
  });

  for (let index = 0; index < sortedList.length; index++) {
    await browser.tabs.move(sortedList[index].tabId, { index: index });
  }

  browser.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Tabs Sorted',
    message: 'Tabs have been sorted by size.'
  });
}
