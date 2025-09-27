# Crawler-In-Droplet-Boilerplate

Easy setup of a Puppeteer-based crawler inside a Digital Ocean droplet using the **Apify Proxy (Residential group)**.
This boilerplate helps you run a detached crawler process on a droplet without depending on your local computer.

---

## Features

* Runs Puppeteer with **stealth mode** to avoid bot detection.
* Supports **Apify Residential proxy** with user/pass authentication.
* Simple input: list of URLs in a `.txt` file.
* Outputs one JSON file per scraped page into `/root/storage`.
* Ready to run in **detached mode** with `nohup`.

---

## Requirements

* A DigitalOcean Droplet (Ubuntu recommended).
* Installed Node.js (>= 18).
* Installed `git` and `curl`.
* An **Apify Proxy token** with access to Residential IPs.

---

## Setup

1. **Clone repository / copy files into Droplet**:

   ```bash
   git clone https://github.com/yourname/Crawler-In-Droplet-Boilerplate.git
   cd Crawler-In-Droplet-Boilerplate
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Check proxy connectivity** *(run from local Git Bash, not inside droplet)*:

   ```bash
   curl -x http://groups-RESIDENTIAL:APIFY_PROXY_TOKEN@proxy.apify.com:8000 http://api.ipify.org?format=json
   ```

   * If this returns an IP, your proxy works.
   * If blocked, check your network (e.g. FortiGate firewall).

4. **Prepare URLs file**:
   Create a file named `single.txt` and put **one URL per line**. Example:

   ```
   https://www.toolmex.com/itemdetail/20MFM-3-220-18P/575
   ```

---

## Run Crawler

### Normal mode

```bash
node itemdetail_crawler.js
```

### Detached mode (recommended)

Run crawler in background so it survives disconnection:

```bash
nohup node itemdetail_crawler.js > crawler.log 2>&1 &
```

* Logs are written to `crawler.log`.
* Check progress live:

  ```bash
  tail -f crawler.log
  ```
* Stop process:

  ```bash
  ps aux | grep itemdetail_crawler.js
  kill <PID>
  ```

---

## Output

All results are stored in `/root/storage/` as individual JSON files.
Example:

```json
{
  "url": "https://www.toolmex.com/itemdetail/20MFM-3-220-18P/575",
  "title": "Tool Name Example",
  "specifications": [
    { "name": "Diameter", "type": "mm", "value": "20" },
    { "name": "Material", "type": "", "value": "HSS" }
  ]
}
```

---

## Notes

* Always test with **1 URL first** (`single.txt`) before running large batches.
* Some corporate networks (like Fortinet) may block proxy connections; run inside the droplet to bypass.
* DigitalOcean IPs are often banned — Apify Residential Proxy rotation avoids that problem.

---

## Stack

* [Puppeteer Extra](https://github.com/berstend/puppeteer-extra)
* [puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
* [Apify Proxy](https://docs.apify.com/proxy)

---
