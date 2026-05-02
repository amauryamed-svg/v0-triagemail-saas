#!/usr/bin/env node
/**
 * Captura screenshots de las pantallas clave de TriageMail para el README.
 *
 * Uso (con dev server corriendo en :3000):
 *   node scripts/capture-mockups.mjs
 *
 * Output: public/mockups/*.png
 */

import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const BASE = process.env.MOCKUP_BASE_URL ?? "http://localhost:3000"
const OUT = "public/mockups"

const SCREENS = [
  { name: "01-onboarding", path: "/onboarding", waitMs: 1200 },
  { name: "02-dashboard", path: "/dashboard", waitMs: 1500 },
  { name: "03-contacts", path: "/contacts", waitMs: 1500 },
  { name: "04-modes", path: "/modes", waitMs: 1200 },
  { name: "05-rules", path: "/rules", waitMs: 1000 },
  { name: "06-settings", path: "/settings", waitMs: 1000 },
]

async function run() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // retina-quality
    colorScheme: "dark",
  })
  const page = await ctx.newPage()

  for (const s of SCREENS) {
    const url = `${BASE}${s.path}`
    console.log(`→ Capturing ${s.name} (${url})`)
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 20000 })
    } catch {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 })
    }
    await page.waitForTimeout(s.waitMs)
    await page.screenshot({
      path: `${OUT}/${s.name}.png`,
      fullPage: false,
    })
  }

  // Bonus: Acciones sync sheet (tab Reunión + tab OnCall)
  console.log("→ Capturing 07-sync-meet (sheet)")
  await page.goto(`${BASE}/contacts`, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(2000)
  const syncBtn = page.locator("button:has-text('Acciones sync · Emily')").first()
  if (await syncBtn.count()) {
    await syncBtn.click()
    await page.waitForTimeout(2200) // wait for /api/meet/evaluate
    await page.screenshot({ path: `${OUT}/07-sync-meet.png`, fullPage: false })

    // Switch to OnCall tab
    console.log("→ Capturing 08-sync-oncall (sheet OnCall tab)")
    const oncallTab = page.locator("button[role='tab']:has-text('OnCall')").first()
    if (await oncallTab.count()) {
      await oncallTab.click()
      await page.waitForTimeout(700)
      await page.screenshot({ path: `${OUT}/08-sync-oncall.png`, fullPage: false })
    }
  }

  await browser.close()
  console.log(`Done. Wrote ${SCREENS.length + 2} screenshots to ${OUT}/`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
