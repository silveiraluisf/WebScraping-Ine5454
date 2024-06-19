const puppeteer = require('puppeteer');
const fs = require('fs');

async function automateWebsite() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({width: 1500, height: 1000});

  console.log("Iniciando web scraping!\n");
  
  const maxItems = 100;
  let itemCount = 0;

  // Abre a pagina e aguarda carregar
  await page.goto("https://www.shopcar.com.br/");
  const base = "https://www.shopcar.com.br/fichatecnica.php?id=";
  const final = {};
  
  for (let id = 13; id < 4070; id++) {
    if (itemCount >= maxItems) {
      console.log("Limite de itens atingido, finalizando...");
      break;
    }

    await page.goto(base + id);
    const [titleElement] = await page.$x('//*[@id="ficha"]/div[1]/span');
    const title = await page.evaluate(el => el?.textContent, titleElement);
    if (titleElement) { 
      console.log("\nCapturando dados de ", title);
      
      final[id] = {
        title: title,
        url: base + id,
        data: {}
      };

      // first column
      for (let x = 2; x < 13; x++) {
        let leftPath = `//*[@id="ficha"]/ul[2]/li[1]/table/tbody/tr[${x}]/td[1]`;                    
        let rightPath = `//*[@id="ficha"]/ul[2]/li[1]/table/tbody/tr[${x}]/td[2]`;

        const [leftElement] = await page.$x(leftPath);
        const [rightElement] = await page.$x(rightPath);
        if (leftElement && rightElement) {
          let leftText = await page.evaluate(el => el?.textContent, leftElement);
          let rightText = await page.evaluate(el => el?.textContent, rightElement);
          final[id].data[leftText.toString()] = rightText.toString();
        };      
      }

      // second column
      for (let x = 2; x < 13; x++) {
        let leftPath = `//*[@id="ficha"]/ul[2]/li[2]/table/tbody/tr[${x}]/td[1]`;
        let rightPath = `//*[@id="ficha"]/ul[2]/li[2]/table/tbody/tr[${x}]/td[2]`;

        const [leftElement] = await page.$x(leftPath);
        const [rightElement] = await page.$x(rightPath);
        if (leftElement && rightElement) {
          let leftText = await page.evaluate(el => el?.textContent, leftElement);
          let rightText = await page.evaluate(el => el?.textContent, rightElement);
          final[id].data[leftText.toString()] = rightText.toString();
        };      
      }
      console.log("Dados capturados com sucesso!\n");
      itemCount++;      
    } else {
      console.log(`ID ${id} não encontrado!\n`)
    }
  }
  
  const jsonString = JSON.stringify(final, null, 2);
  fs.writeFileSync('output.json', jsonString);

  console.log('\n\nCONVERTIDO E SALVO NO ARQUIVO JSON');
  await browser.close();
}

automateWebsite();