import re

BAD_WORDS = [
    "amk", "aq", "mk", "orospu", "sikti", "sikerim", "yarrak",
    "ananı", "sikiş", "fuck", "shit", "bitch" "bok"
]

def is_clean(text: str) -> bool:
    if not text:
        return False

    lowered = text.lower()

    for word in BAD_WORDS:
        if word in lowered:
            return False

    return True
