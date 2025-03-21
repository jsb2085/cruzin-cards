import requests, os
from dotenv import load_dotenv

load_dotenv()
# Replace with your ScraperAPI key
SCRAPER_API_KEY = os.environ.get("SCRAPER_API")

def get_ebay_prices(search_query):
    # Format search query for eBay
    search_query = search_query.replace(" ", "+").replace("/", "%2F")
    ebay_url = f"https://www.ebay.com/sch/i.html?_nkw={search_query}&LH_Complete=1&LH_Sold=1"

    # ScraperAPI URL
    proxy_url = f"https://api.scraperapi.com/?api_key={SCRAPER_API_KEY}&url={ebay_url}"

    # Make request through ScraperAPI
    response = requests.get(proxy_url)

    if response.status_code != 200:
        return f"Error: {response.status_code}, possibly blocked by eBay"

    # Parse response HTML
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(response.text, "html.parser")

    # Extract sold prices
    prices = []
    price_elements = soup.find_all("span", class_="s-item__price")

    for price in price_elements[:7]:  # Get top 5 sold prices
        print(price)
        prices.append(price.text.strip())

    average = get_average_price(prices)

    return average if prices else "No sold items found"

def clean_price(price):
    """Extracts numeric values from a price string and returns their average if a range is given."""
    price = price.replace("$", "").replace(",", "")  # Remove $ signs and commas

    # If the price contains "to", it's a range (e.g., "0.99 to 2.99")
    if "to" in price:
        low, high = map(float, price.split(" to "))
        return (low + high) / 2  # Return the average of the range

    return float(price)  # Convert single price to float

def get_average_price(prices):
    """Takes a list of prices and returns the average of the last three values."""
    if len(prices) < 3:
        return "Not enough prices to compute an average."

    # Extract the last three prices and clean them
    last_three_prices = [clean_price(p) for p in prices[-3:]]

    # Compute the average
    return sum(last_three_prices) / len(last_three_prices)

# Example Usage
#print(get_ebay_prices("Bryce Harper 89ASB-40"))
