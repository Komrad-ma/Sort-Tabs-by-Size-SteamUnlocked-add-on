(() => {
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
  })();
  