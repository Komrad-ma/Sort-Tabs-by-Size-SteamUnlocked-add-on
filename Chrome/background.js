chrome.action.onClicked.addListener(() => {
  console.log("Extension clicked - Starting tab sorting.");
  sortTabsByXPath();
});

async function sortTabsByXPath() {
  console.log("Collecting tabs...");

  async function createListEntry(tabId) {
    console.log(`Processing tab ID: ${tabId}`);
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: getXPathContent
      });

      if (results && results[0] && results[0].result) {
        console.log(`Tab ${tabId} XPath value: ${results[0].result.xpathValue}`);
        return { tabId: tabId, xpathValue: results[0].result.xpathValue };
      } else {
        console.log(`Tab ${tabId} returned no XPath result.`);
        return { tabId: tabId, xpathValue: 9999999 };
      }
    } catch (error) {
      console.error(`Error processing tab ${tabId}:`, error);
      return { tabId: tabId, xpathValue: 9999999 };
    }
  }

  function getXPathContent() {
    const xpath = '/html/body/div/div/div/div/div[1]/div[1]/div[3]/p[3]/a/em';
    let result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.STRING_TYPE,
      null
    ).stringValue || "Size: 9999 GB";

    let sizeText = result.replace("Size: ", "").trim();
    let sizeValue = parseFloat(sizeText);

    if (sizeText.includes("GB")) {
      sizeValue *= 1024;
    }

    return {
      xpathValue: sizeValue,
    };
  }

  const tabs = await chrome.tabs.query({ currentWindow: true });
  console.log(`Found ${tabs.length} tabs.`);

  let promiseList = tabs.map(tab => createListEntry(tab.id));

  const sortedList = (await Promise.all(promiseList)).sort((a, b) => {
    return a.xpathValue - b.xpathValue;
  });

  console.log("Sorted list:", sortedList);

  for (let index = 0; index < sortedList.length; index++) {
    console.log(`Moving tab ID: ${sortedList[index].tabId} to position ${index}`);
    await chrome.tabs.move(sortedList[index].tabId, { index: index });
  }

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Tabs Sorted',
    message: 'Tabs have been sorted by size.'
  });

  console.log("Sorting complete, notification sent.");
}
