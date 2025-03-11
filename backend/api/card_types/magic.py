import requests
import json
import os
from typing import List, Optional
from dotenv import load_dotenv
from pydantic import BaseModel
from groq import Groq


load_dotenv()

groq = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class MagicCard(BaseModel):
    name: str
    year: str

def magic_name_and_year(card_name, year):
    base_url = "https://api.scryfall.com/cards/search"
    query = f'!"{card_name}" year:{year}'
    params = {'q': query}
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data['total_cards'] > 0:
            return data['data']
        else:
            return f"No cards found for '{card_name}' in {year}."
    else:
        return f"Error: {response.status_code}"


def ai_name_year_magic(card_text: str):
    print("Card text: " + card_text)
    chat_completion = groq.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a productivity assistant that uses extracted trading card text to determine what the card is.\n"
                f"The JSON object must use the schema: {json.dumps(MagicCard.model_json_schema(), indent=2)}",
            },
            {
                "role": "user",
                "content": f"Using the extracted text. What is this magic card? : '{card_text}'",
            },
        ],
        model="llama-3.3-70b-specdec",
        temperature=0.5,
        stream=False,
        response_format={"type": "json_object"},
    )
    return MagicCard.model_validate_json(chat_completion.choices[0].message.content)

# for testing purposes
# cards = magic_name_and_year("Pit Automaton", 2025)
# for card in cards:
#     print(f"Name: {card['name']}")
#     print(f"Set: {card['set_name']}")
#     print(f"Released At: {card['released_at']}")
#     print(f"Mana Cost: {card['mana_cost']}")
#     print(f"Type Line: {card['type_line']}")
#     print(f"Oracle Text: {card['oracle_text']}")
#     print("-" * 40)