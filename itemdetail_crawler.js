// Check the proxy status and the wifi for firewalls (like FortiGate) (run with Git Bash)
// curl -x http://{PROXY_TYPE}:{APIFY_PROXY_TOKEN}@proxy.apify.com:8000 http://api.ipify.org?format=json

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const PROXY_TYPE = 'groups-RESIDENTIAL';
const APIFY_PROXY_TOKEN = 'apify_proxy_abcdefghjilmnopqrstvuwxyz';
const proxyHost = 'proxy.apify.com:8000';

// Leer URLs desde archivo
const urlsPath = path.resolve('./single.txt'); // Intenta con un txt de una sola url primero
const urls = fs.readFileSync(urlsPath, 'utf-8')
    .split('\n')
    .map(u => u.trim())
    .filter(Boolean);

// Crear carpeta storage si no existe
const storageDir = path.resolve('/root/storage');
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir);
}

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            `--proxy-server=http://${proxyHost}`,   // sin user/pass
        ],
    });

    for (const url of urls) {
        const page = await browser.newPage();

        // Autenticación para el proxy
        await page.authenticate({
            username: PROXY_TYPE,
            password: APIFY_PROXY_TOKEN,
        });

        // Desde aquí debes configurar el crawler para detectar la información correctamente
        // Adaptado para una página de ejemplo: https://www.toolmex.com/itemdetail/20MFM-3-220-18P/575
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Esperar título
            await page.waitForSelector('.product-name, h1', { timeout: 15000 }).catch(() => null);
            const title = await page.$eval('.product-name, h1', el => el.innerText.trim()).catch(() => null);

            // Extraer specs
            const specifications = await page.$$eval('.product-specs tr, table tr', rows => {
                const result = [];
                rows.forEach(row => {
                    const cells = Array.from(row.querySelectorAll('td, th'));
                    result.push({
                        name: cells[0]?.innerText.trim() || "",
                        type: cells[1]?.innerText.trim() || "",
                        value: cells[2]?.innerText.trim() || "",
                    });
                });
                return result.filter(r => r.name || r.type || r.value);
            }).catch(() => []);

            // Guardar JSON
            const fileName = `crawledObj_${Date.now()}.json`;
            const filePath = path.join(storageDir, fileName);
            fs.writeFileSync(filePath, JSON.stringify({ url, title, specifications }, null, 2));

            console.log(`Scrapeado: ${filePath}`);

        } catch (err) {
            console.error(`Error al procesar ${url}:`, err.message);
        } finally {
            await page.close();
        }
    }

    await browser.close();
    console.log('Scraping completado.');
})();