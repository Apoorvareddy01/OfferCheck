import os
import joblib
import fitz
import easyocr
from PIL import Image

reader = easyocr.Reader(['en'])

from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection

import bcrypt
import jwt
import datetime

app = Flask(__name__)

CORS(app)

# Load AI Model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(
    os.path.join(BASE_DIR, "ai", "models", "scam_detector.pkl")
)

vectorizer = joblib.load(
    os.path.join(BASE_DIR, "ai", "models", "tfidf_vectorizer.pkl")
)

# Scam keywords and their reasons
SCAM_KEYWORDS = {

    # Fees
    "registration fee": "Registration fee requested",
    "processing fee": "Processing fee requested",
    "training fee": "Training fee requested",
    "security deposit": "Security deposit requested",
    "deposit": "Advance payment requested",

    # Contact methods
    "whatsapp": "Communication only through WhatsApp",
    "telegram": "Communication through Telegram",

    # Pressure tactics
    "urgent": "Urgent hiring language",
    "limited seats": "Creates false urgency",
    "immediate joining": "Immediate joining demanded",

    # Suspicious job claims
    "guaranteed job": "Unrealistic job guarantee",
    "no interview": "No interview required",
    "work from home": "Work From Home offer",
    "work remotely": "Remote work advertisement",
    "part time": "Part-time advertisement",
    "parttime": "Part-time advertisement",

    # Income claims
    "earn": "High income promise",
    "per day": "Daily income promise",
    "$40-400": "Unrealistic salary range",
    "40-400": "Unrealistic salary range",

    # Online task scams
    "processing online order": "Simple online task offer",
    "online order": "Online order processing offer",

    # Generic ads
    "contact us": "Generic contact request",
    "learn more": "Redirects to external platform",
    "sponsored": "Social media sponsored advertisement"
}

def detect_reasons(job_description):
    reasons = []

    text = job_description.lower()

    for keyword, reason in SCAM_KEYWORDS.items():
        if keyword in text:
            reasons.append(reason)

    return reasons

def calculate_trust_score(prediction, reasons):

    trust_score = 100

    deductions = {
    "Registration fee requested": 25,
    "Processing fee requested": 20,
    "Training fee requested": 20,
    "Security deposit requested": 20,
    "Communication only through WhatsApp": 15,
    "Communication through Telegram": 15,
    "Urgent hiring language": 10,
    "Creates false urgency": 10,
    "Immediate joining demanded": 15,
    "Work From Home offer": 5,
    "Remote work advertisement": 10,
    "Part-time advertisement": 5,
    "No interview required": 15,
    "Immediate payment requested": 20,
    "Advance payment requested": 15,
    "Unrealistic job guarantee": 20,
    "High income promise": 15,
    "Daily income promise": 10,
    "Unrealistic salary range": 20,
    "Simple online task offer": 20,
    "Online order processing offer": 20,
    "Generic contact request": 10,
    "Redirects to external platform": 5,
    "Social media sponsored advertisement": 5
}

    for reason in reasons:
        trust_score -= deductions.get(reason, 0)

    # Extra deduction if AI predicts scam
    if prediction == "scam":
        if len(reasons) == 0:
            trust_score -= 40
        else:
            trust_score -= 10

    # Keep score between 0 and 100
    trust_score = max(0, min(100, trust_score))

    return trust_score

def get_risk_level(score):

    if score >= 80:
        return "Low"

    elif score >= 50:
        return "Medium"

    else:
        return "High"

app.config["SECRET_KEY"] = "offercheck_secret_key_2026"
@app.route("/")
def home():
    return {"message": "Welcome to OfferCheck API"}

@app.route("/test-db")
def test_db():
    try:
        connection = get_db_connection()
        connection.close()
        return {"message": "Database connected successfully!"}
    except Exception as e:
        return {"error": str(e)}
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        fullname = data["fullname"]
        email = data["email"]
        password = data["password"]

        hashed_password = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
        INSERT INTO users (fullname, email, password)
        VALUES (%s, %s, %s)
        """

        cursor.execute(query, (fullname, email, hashed_password))

        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "User registered successfully!"}

    except Exception as e:
        return {"error": str(e)}
    
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        email = data["email"]
        password = data["password"]

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = "SELECT * FROM users WHERE email = %s"
        cursor.execute(query, (email,))

        user = cursor.fetchone()

        cursor.close()
        connection.close()

        if user is None:
            return {"error": "Invalid email or password"}

        stored_password = user["password"]

        if bcrypt.checkpw(password.encode("utf-8"), stored_password.encode("utf-8")):

            token = jwt.encode(
                {
                    "user_id": user["id"],
                    "email": user["email"],
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
                },
                app.config["SECRET_KEY"],
                algorithm="HS256"
            )

            return {
                "message": "Login successful!",
                "token": token,
                "user": {
                    "id": user["id"],
                    "fullname": user["fullname"],
                    "email": user["email"]
                }
            }

        else:
            return {"error": "Invalid email or password"}

    except Exception as e:
        return {"error": str(e)}
def analyze_job_description(job_description):
    # Convert text into TF-IDF
    job_vector = vectorizer.transform([job_description])

    # Prediction
    prediction = model.predict(job_vector)[0]

    # Confidence
    probability = model.predict_proba(job_vector)[0]
    confidence = round(max(probability) * 100, 2)

    # Detect scam reasons
    reasons = detect_reasons(job_description)

    # Strong scam indicators
    strong_reasons = [
        "Registration fee requested",
        "Processing fee requested",
        "Training fee requested",
        "Security deposit requested",
        "Advance payment requested",
        "Immediate payment requested",
        "High income promise",
        "Unrealistic salary range",
        "Simple online task offer",
        "Online order processing offer",
        "Communication only through WhatsApp",
        "Communication through Telegram",
        "Unrealistic job guarantee"
    ]

    # Count strong scam indicators
    strong_count = sum(reason in strong_reasons for reason in reasons)

    # Hybrid Decision
    if prediction == "genuine" and strong_count >= 2:
        prediction = "scam"

    # Calculate trust score
    trust_score = calculate_trust_score(prediction, reasons)

    # Calculate risk level
    risk_level = get_risk_level(trust_score)

    # Save scan history
    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO scan_history
    (job_description, prediction, confidence, trust_score, risk_level)
    VALUES (%s, %s, %s, %s, %s)
    """

    cursor.execute(
        query,
        (
            job_description,
            prediction,
            confidence,
            trust_score,
            risk_level
        )
    )

    connection.commit()
    cursor.close()
    connection.close()

    return {
        "prediction": prediction,
        "confidence": confidence,
        "trust_score": trust_score,
        "risk_level": risk_level,
        "reasons": reasons
    }

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    job_description = data.get("job_description")

    if not job_description:
        return jsonify({
            "error": "Job description is required"
        }), 400

    result = analyze_job_description(job_description)

    return jsonify(result)
print("\nAvailable Routes:")
print(app.url_map)

def extract_text_from_pdf(filepath):

    text = ""

    pdf = fitz.open(filepath)

    for page in pdf:
        text += page.get_text()

    pdf.close()

    return text

def extract_text_from_image(filepath):

    results = reader.readtext(filepath)

    text = ""

    for result in results:
        text += result[1] + " "

    return text

@app.route("/upload", methods=["POST"])
def upload_file():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    upload_folder = "uploads"

    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    filepath = os.path.join(upload_folder, file.filename)

    file.save(filepath)

    extension = os.path.splitext(file.filename)[1].lower()

    if extension == ".pdf":
        text = extract_text_from_pdf(filepath)

    elif extension in [".png", ".jpg", ".jpeg"]:
        text = extract_text_from_image(filepath)

    else:
        return jsonify({
            "error": "Unsupported file type"
        }), 400

    print("\n======== Extracted Text ========")
    print(text)
    print("================================\n")

    result = analyze_job_description(text)

    return jsonify(result)

@app.route("/history", methods=["GET"])
def history():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT *
        FROM scan_history
        ORDER BY created_at DESC
        """

        cursor.execute(query)
        history = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify(history)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


print("\nAvailable Routes:")
print(app.url_map)

if __name__ == "__main__":
    app.run(debug=True)

