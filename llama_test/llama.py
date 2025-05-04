from openai import OpenAI

client = OpenAI(
  base_url = "https://infer.e2enetworks.net/project/p-5577/genai/llama_4_scout_17b_16e_instruct/v1",
  api_key = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJGSjg2R2NGM2pUYk5MT2NvNE52WmtVQ0lVbWZZQ3FvcXRPUWVNZmJoTmxFIn0.eyJleHAiOjE3Nzc4MzAyMDIsImlhdCI6MTc0NjI5NDIwMiwianRpIjoiN2RkNTVmYjUtYTE4Ny00OWQ2LTljYmUtYzA2MzYyN2FlYWRmIiwiaXNzIjoiaHR0cDovL2dhdGV3YXkuZTJlbmV0d29ya3MuY29tL2F1dGgvcmVhbG1zL2FwaW1hbiIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJkZDg3MDRiOC05YWViLTQ2NjUtYTY1OS02MmQ2MTIyNmNkMTciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhcGltYW51aSIsInNlc3Npb25fc3RhdGUiOiI3ZmU4NjA2Mi01NGFjLTRiYmUtYTZjNy0yODc0NzY1MjliNzQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImFwaXVzZXIiLCJkZWZhdWx0LXJvbGVzLWFwaW1hbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6IjdmZTg2MDYyLTU0YWMtNGJiZS1hNmM3LTI4NzQ3NjUyOWI3NCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IlByYW5hdiBWIiwicHJpbWFyeV9lbWFpbCI6InByYW5hdnYyMDAyQGdtYWlsLmNvbSIsImlzX3ByaW1hcnlfY29udGFjdCI6dHJ1ZSwicHJlZmVycmVkX3VzZXJuYW1lIjoicHJhbmF2djIwMDJAZ21haWwuY29tIiwiZ2l2ZW5fbmFtZSI6IlByYW5hdiIsImZhbWlseV9uYW1lIjoiViIsImVtYWlsIjoicHJhbmF2djIwMDJAZ21haWwuY29tIiwiaXNfaW5kaWFhaV91c2VyIjpmYWxzZX0.BulrP3fkwdm589NWbcCompkoi6U-0X4cQsNc2gzvMq5iisgWFZ_i2KxwO7gnzAMqjtGvL6ET15Cw2NAVXVnDUcFFHrH-FmR6PWedRfWx9ikBVTByFKp-nMVZC8PMIOc1J0Ohytxye1_791Vbr-jHLHfY-c4-kSXH1n8TWqJD8ZY"
)
completion = client.chat.completions.create(
    model='llama_4_scout_17b_16e_instruct',
    messages=[{"role":"user",
               "content":"Can you write a poem about open source machine learning?"}],
    temperature=0.5,
    max_tokens=1024,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=1,
    stream=True
  )
try:
    for chunk in completion:
        # Check if choices list exists and has at least one item
        if hasattr(chunk, 'choices') and len(chunk.choices) > 0:
            # Check if the first choice has a delta with content
            if hasattr(chunk.choices[0], 'delta') and hasattr(chunk.choices[0].delta, 'content') and chunk.choices[0].delta.content is not None:
                print(chunk.choices[0].delta.content, end="")
    print("\n\nGeneration complete!")
except Exception as e:
    print(f"\n\nError: {str(e)}")