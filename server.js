import express from "express"
import fetch from "node-fetch"
import { DOMParser } from "@xmldom/xmldom"

const app = express()

app.get("/api/nyaa", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")

  const q = req.query.q || ""
  if (!q) return res.json([])

  const url = `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(q)}&rss=1`

  let xml
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    })
    xml = await r.text()
  } catch {
    return res.json([])
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, "text/xml")
  const items = Array.from(doc.getElementsByTagName("item"))

  const results = items.map(item => {
    const title = item.getElementsByTagName("title")[0]?.textContent || ""
    const desc = item.getElementsByTagName("description")[0]?.textContent || ""

    const magnet = desc.match(/href="(magnet:[^"]+)"/)?.[1] || ""
    const hash = magnet.match(/btih:([a-fA-F0-9]+)/)?.[1] || ""

    return { title, magnet, hash }
  })

  res.json(results)
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log("Nyaa API running on port", port))
