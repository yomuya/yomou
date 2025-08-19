# Novel Tracker
This tool is created to have a centralized hub for tracking and reading novels. 
Initially this was meant to only include Syosetu web novels, but will be expanded to include Light Novels and possibly other custom sites.

## Features
✅: implemented ⚠️: Implemented, but may change in functionality ❌: Not implemented
- ✅ Native Syosetu tracking
- ✅ Scrape chapters*
- ✅ Offline Storage
- ✅ Reader for stored content
- ✅ Progressive Web App (PWA)
- ❌ Light Novel Extraction
- ❌ Custom site tracking (will need to find a user friendly approach which doesn't include looking through html tags for this)

*it has to respect robots.txt for the pages. Currently it only works for syosetu, so the wait time is hardcoded as 1,5 seconds between each scrape. 

## Installation
Run the project through Docker: 
```bash
docker run -d \
  --name-tracker \
  -p 3000:3000 \
  -v ./data:/appdata
  -e JWT_SECRET: <secret> \ #define a secret
  -e NOVEL_UPDATE_MINUTES: 60 \ # minutes between automatic fetch
  ghcr.io/yomuya/yomou:latest
```
This can also be done through Docker compose:
```bash
services:
  novel-tracker:
    image: ghcr.io/yomuya/yomou:latest
    container_name: novel-tracker
    ports:
      - 3000:3000
    environment: 
      JWT_SECRET: $JWT_SECRET # define a secret
      NOVEL_UPDATE_MINUTES: 15 # minutes between automatic fetch
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```
Alternatively build this from source:
```bash
npm run bootstrap
npm run start
```
## Usage
Usage through desktop will be done through a browser through localhost or a public accessable ip/port hosting the tracker.
Additionally, once the browser is accessed the tracker can be installed as a PWA on both desktop and mobiles.


