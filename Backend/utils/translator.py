from googletrans import Translator

translator = Translator()

def translate_text(text, dest_lang='ta'):
    translation = translator.translate(text, dest=dest_lang)
    return translation.text
