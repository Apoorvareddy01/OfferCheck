import joblib

# Load the trained model
model = joblib.load("models/scam_detector.pkl")

# Load the TF-IDF vectorizer
vectorizer = joblib.load("models/tfidf_vectorizer.pkl")

# New job description to test

job_description = """
Congratulations!

You have been selected for a Work From Home job.

Pay ₹1000 registration fee immediately to confirm your job.

Contact only through WhatsApp.

Limited seats available.
"""

# Convert text into numerical features
job_vector = vectorizer.transform([job_description])

# Predict the result
prediction = model.predict(job_vector)

# Get prediction probabilities
probability = model.predict_proba(job_vector)

# Calculate confidence
confidence = max(probability[0]) * 100


# Display results
print("Prediction:", prediction[0])
print(f"Confidence: {confidence:.2f}%")

# Show the order of classes (for learning/debugging)
print("Classes:", model.classes_)