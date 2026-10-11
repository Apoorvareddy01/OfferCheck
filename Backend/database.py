import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="mysql01",
        database="offercheck"
    )

    return connection