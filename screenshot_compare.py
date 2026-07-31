# screenshot_compare.py
import asyncio
import os

from playwright.async_api import async_playwright

PAGES_SISTEMA = [
    ("dashboard", "http://localhost:5173/dashboard"),
    ("pacientes", "http://localhost:5173/pacientes"),
    ("cred", "http://localhost:5173/programas/cred"),
    ("pai", "http://localhost:5173/programas/pai"),
    ("tamizaje", "http://localhost:5173/programas/tamizaje"),
    ("anemia", "http://localhost:5173/programas/anemia"),
    ("gestacional", "http://localhost:5173/programas/gestacional"),
    ("profesionales", "http://localhost:5173/profesionales"),
    ("reportes", "http://localhost:5173/reportes"),
    ("usuarios", "http://localhost:5173/usuarios"),
    ("configuracion", "http://localhost:5173/configuracion"),
]

TABS_PROGRAMA = ["Dashboard", "Pacientes", "Estadísticas", "Reportes"]

os.makedirs("screenshots/sistema", exist_ok=True)


async def capturar():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        await page.goto("http://localhost:5173/login")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/sistema/login.png", full_page=True)
        print("login capturado")

        await page.fill("#dni", "12345678")
        await page.fill("#password", "Admin1234")
        await page.click('button[type="submit"]')
        await page.wait_for_url("**/dashboard", timeout=10000)
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(1500)

        for nombre, url in PAGES_SISTEMA:
            await page.goto(url)
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(1200)
            await page.screenshot(path=f"screenshots/sistema/{nombre}.png", full_page=True)
            print(f"  {nombre} capturado")

            if "programas" in url:
                for tab_label in TABS_PROGRAMA:
                    boton = page.locator(f'button:text-is("{tab_label}")')
                    if await boton.count() == 0:
                        print(f"    tab '{tab_label}' no encontrado en {nombre}")
                        continue
                    await boton.first.click()
                    await page.wait_for_timeout(1000)
                    slug = tab_label.lower().replace("í", "i")
                    await page.screenshot(path=f"screenshots/sistema/{nombre}_tab_{slug}.png", full_page=True)
                    print(f"    {nombre} tab {tab_label} capturado")

        await browser.close()
        print("\nTodos los screenshots capturados en screenshots/sistema/")


asyncio.run(capturar())
