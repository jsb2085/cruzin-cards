import requests
import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from groq import Groq
from symspellpy import SymSpell

load_dotenv()

groq = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class PokemonCard(BaseModel):
    name: str
    set_number: str

def pokemon_name_and_set_number(card_name, set_number):
    print("HERE 3")
    base_url = "https://api.pokemontcg.io/v2/cards"
    # Match name to most similar card name in the database
    sym_spell = SymSpell(max_dictionary_edit_distance=2)
    sym_spell.load_dictionary("card_names.txt", term_index=0, count_index=1)
    suggestions = sym_spell.lookup(card_name, verbosity=2, max_edit_distance=2)
    if suggestions:
        card_name = suggestions[0].term
        print(suggestions[0].term)

    query = f'name:"{card_name}"'
    params = {'q': query}
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data['totalCount'] > 0:
            for card in data['data']:
                if card['number'] == set_number:
                    return card
        else:
            print(f"No cards found for '{card_name}' with set number {set_number}.")
            return None
    else:
        return f"Error: {response.status_code}"

def ai_name_set_number_pokemon(card_text: str):
    print("HERE 2")
    chat_completion = groq.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a productivity assistant that uses extracted trading card text to determine what the card is.\n"
                f"The JSON object must use the schema: {json.dumps(PokemonCard.model_json_schema(), indent=2)}. Let set_number be the number of the card in the set, which is always in the form 'set_number/printed_total'. For example, if the set number and total is 065/105, set_number should be 65. If there are letters right before the set number, they should be included. Example, 'SWSH157' should return 'SWSH157', and 'XY52' should return 'XY52'. Hyphenate GX/EX cards, use all spaces for VMAX and BREAK cards. For example, 'Mega Charizard GX' should be 'Mega Charizard-GX', but 'Lugia BREAK' should remain 'Lugia Break'. Include symbols, like &. For example, 'Mewtwo & Mew GX' should be 'Mewtwo & Mew-GX'.",
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