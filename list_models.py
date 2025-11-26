import google.generativeai as genai
import os

GEMINI_API_KEY = ""
genai.configure(api_key=GEMINI_API_KEY)

with open("models.txt", "w") as f:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            f.write(m.name + "\n")
print("Models written to models.txt")
