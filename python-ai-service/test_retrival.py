
from app.context import retrieve_relevant_chunks

repo = {
    "files": {
        "app/auth.py": """
def generate_token(user_id):
    return create_access_token(user_id)

def login(username, password):
    user = authenticate(username, password)
    return generate_token(user.id)
""",
        "app/database.py": """
def get_user(user_id):
    return db.query(User).filter_by(id=user_id).first()
""",
        "app/utils.py": """
def format_name(name):
    return name.strip().title()
"""
    }
}

questions = [
    "Where is the authentication token generated?",
    "How does the login function work?",
    "Where is the user retrieved from the database?"
]

for question in questions:
    print("\nQUESTION:", question)

    chunks = retrieve_relevant_chunks(repo, question, 3)

    for chunk in chunks:
        print(
            chunk["path"],
            chunk["start_line"],
            chunk["end_line"]
        )
