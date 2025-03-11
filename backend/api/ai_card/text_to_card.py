import json
import os
from typing import List, Optional
from dotenv import load_dotenv
from pydantic import BaseModel
from groq import Groq

load_dotenv()

groq = Groq(api_key=os.environ.get("GROQ_API_KEY"))


# Card model for generating card info
class Card(BaseModel):
    name: str
    number: str
    set: str
    card_company: str
    numeration: str
    autograph: bool


def create_card(card_text: str):
    print("Card text: " + card_text)
    chat_completion = groq.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a productivity assistant that uses extracted trading card text to determine what the card is.\n"
                f"The JSON object must use the schema: {json.dumps(Card.model_json_schema(), indent=2)}",
            },
            {
                "role": "user",
                "content": f"Using the extracted text. What is this trading card? Numeration looks like '10/25' for example. : '{card_text}'",
            },
        ],
        model="llama-3.3-70b-specdec",
        temperature=0.5,
        stream=False,
        response_format={"type": "json_object"},
    )
    print(chat_completion.choices[0].message.content)
    return Card.model_validate_json(chat_completion.choices[0].message.content)

