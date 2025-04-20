import requests
from bs4 import BeautifulSoup

def get_market_prices():
    url = "https://agmarknet.gov.in/"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        table = soup.find("table", {"id": "cphBody_GridPriceData"})
        rows = table.find_all("tr")[1:]

        market_data = []
        for row in rows[:10]:
            cols = row.find_all("td")
            data = {
                "state": cols[0].text.strip(),
                "district": cols[1].text.strip(),
                "market": cols[2].text.strip(),
                "commodity": cols[3].text.strip(),
                "variety": cols[4].text.strip(),
                "arrival_date": cols[5].text.strip(),
                "min_price": cols[6].text.strip(),
                "max_price": cols[7].text.strip(),
                "modal_price": cols[8].text.strip(),
            }
            market_data.append(data)

        return market_data

    except Exception as e:
        print("Scraping Error:", e)
        return []
