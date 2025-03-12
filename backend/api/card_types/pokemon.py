import requests
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from groq import Groq

load_dotenv()

groq = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class PokemonCard(BaseModel):
    name: str
    year: str

def pokemon_name_and_year(card_name, year):
    base_url = "https://api.pokemontcg.io/v2/cards"
    query = f'name:"{card_name}" set.series:"{year}"'
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