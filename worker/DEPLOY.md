# Deploy — SnakeConverter Share Worker

## 1. R2 Bucket oluştur (1 dakika)

Cloudflare Dashboard → R2 → Create Bucket
- Bucket name: `snakeconverter-pdfs`
- Location: Automatic

## 2. Worker'ı deploy et (terminal)

```bash
cd worker
npm install -g wrangler
wrangler login
wrangler deploy
```

## 3. Test et

```bash
# Upload
curl -X POST https://snakeconverter.com/api/share/upload \
  -F "file=@test.pdf" | json_pp

# Download (id'yi yukardaki responsetan al)
curl https://snakeconverter.com/api/share/<ID>
```

## Ücretsiz limitler (Cloudflare free tier)

| | Limit |
|---|---|
| R2 Storage | 10 GB/ay |
| R2 Class A (upload) | 1M istek/ay |
| R2 Class B (download) | 10M istek/ay |
| Workers requests | 100.000/gün |

## Dosya kuralları

- Max boyut: 25 MB
- Süre: 7 gün (otomatik silinir)
- Format: PDF only
