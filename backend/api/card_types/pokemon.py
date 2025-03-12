import requests
import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from groq import Groq

load_dotenv()

groq = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class PokemonCard(BaseModel):
    name: str
    set_number: str

def pokemon_name_and_set_number(card_name, set_number):
    base_url = "https://api.pokemontcg.io/v2/cards"
    query = f'name:"{card_name}" number:"{set_number}"'
    params = {'q': query}
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data['total_cards'] > 0:
            return data['data']
        else:
            return f"No cards found for '{card_name}' in {set_number}."
    else:
        return f"Error: {response.status_code}"
    
def ai_name_year_pokemon(card_text: str):
    print("Card text: " + card_text)
    chat_completion = groq.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a productivity assistant that uses extracted trading card text to determine what the card is.\n"
                f"The JSON object must use the schema: {json.dumps(PokemonCard.model_json_schema(), indent=2)}",
            },
            {
                "role": "user",
                "content": f"Using the extracted text. What is this pokemon card? : '{card_text}'",
            },
        ],
        model="llama-3.3-70b-specdec",
        temperature=0.5,
        stream=False,
        response_format={"type": "json_object"},
    )
    return PokemonCard.model_validate_json(chat_completion.choices[0].message.content)