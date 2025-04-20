import requests

# API Endpoint for Daily Market Prices (as per your last message)
url = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24"

# Params with filtering by Commodity
params = {
    "api-key": "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b",
    "format": "json",
    "limit": 10,  # You can increase this if needed
    "filters[Commodity]": "Tomato"  # ✅ Filtering only Tomato data
}

response = requests.get(url, params=params)

print("Status Code:", response.status_code)

try:
    data = response.json()
    print("\n🔍 Filtered Market Prices for 'Tomato':")
    for record in data.get("records", []):
        print(f"{record['Market']} ({record['State']}): ₹{record['Modal_Price']} - {record['Arrival_Date']}")
except Exception as e:
    print("❌ Failed to parse JSON response:", e)
    print("Raw Response:\n", response.text)
