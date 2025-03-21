import requests

API_KEY = "0a296ae9-d6b3-45aa-8725-c301c56d5db4"
BASE_URL = "https://api.pokemontcg.io/v2/cards"
PAGE_SIZE = 250  # Maximum cards per page

def fetch_all_card_names():
    unique_card_names = set()  # Use a set to store unique names
    page = 1  # Start from the first page

    while True:
        params = {"page": page, "pageSize": PAGE_SIZE}
        headers = {"X-Api-Key": API_KEY}

        response = requests.get(BASE_URL, headers=headers, params=params)
        if response.status_code != 200:
            print(f"Error: {response.status_code} - {response.text}")
            break

        data = response.json()

        # Extract card names and add to set
        for card in data.get("data", []):
            unique_card_names.add(card["name"])

        print(f"Fetched page {page}, total unique cards: {len(unique_card_names)}")

        # Check if there are more pages
        if len(data.get("data", [])) < PAGE_SIZE:
            break  # No more pages

        page += 1  # Move to the next page

    return unique_card_names

def save_card_names_to_file(card_names, filename="card_names.txt"):
    with open(filename, "w", encoding="utf-8") as f:
        for name in sorted(card_names):  # Sort for consistency
            f.write(f"{name} 1\n")  # Assign frequency 1 for SymSpell

    print(f"Saved {len(card_names)} unique card names to {filename}")

if __name__ == "__main__":
    card_names = fetch_all_card_names()
    save_card_names_to_file(card_names)