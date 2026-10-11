import pandas as pd
import random

# List of genuine companies
companies = [
    "TCS",
    "Infosys",
    "Wipro",
    "Accenture",
    "Capgemini",
    "IBM",
    "Google",
    "Microsoft",
    "Amazon",
    "Oracle",
    "Deloitte",
    "HCL",
    "Tech Mahindra",
    "Cognizant",
    "SAP"
]

# List of job roles
job_roles = [
    "Software Engineer",
    "Python Developer",
    "Java Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "AI Engineer",
    "Cloud Engineer",
    "DevOps Engineer",
    "QA Engineer",
    "Cybersecurity Analyst"
]

# Genuine job templates
genuine_templates = [
    "{company} is hiring {role}. Apply through the official careers portal. No registration fee is required.",
    "{company} is recruiting {role}. Candidates will attend an online assessment and HR interview.",
    "{company} invites applications for the position of {role}. Freshers are welcome to apply.",
    "{company} is offering full-time opportunities for {role}. Selection is based on interviews and technical assessments.",
    "{company} has opened applications for {role}. Apply through the official company website."
]

# Scam job templates
scam_templates = [
    "Congratulations! You have been selected for {role}. Pay ₹1000 registration fee immediately to confirm your job.",
    "Earn ₹5000 daily from home as a {role}. No interview required. Contact only through WhatsApp.",
    "Urgent hiring for {role}. Deposit ₹1500 as processing fee before joining.",
    "Guaranteed job for {role}. Pay training fee today and start tomorrow.",
    "Limited seats available for {role}. Send payment immediately to reserve your position."
]

# Store all records
dataset = []

# Generate 500 genuine jobs
for i in range(500):

    company = random.choice(companies)
    role = random.choice(job_roles)
    template = random.choice(genuine_templates)

    description = template.format(company=company, role=role)

    dataset.append({
        "job_description": description,
        "company": company,
        "job_role": role,
        "label": "genuine"
    })

    # Generate 500 scam jobs
for i in range(500):

    role = random.choice(job_roles)
    template = random.choice(scam_templates)

    description = template.format(role=role)

    dataset.append({
        "job_description": description,
        "company": "Unknown",
        "job_role": role,
        "label": "scam"
    })

    # Convert list to DataFrame
df = pd.DataFrame(dataset)

# Save dataset to CSV
df.to_csv("dataset/job_dataset.csv", index=False)

print("Dataset generated successfully!")
print("Total records:", len(df))
print(df.head())