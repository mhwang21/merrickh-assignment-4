from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords

# Download NLTK stopwords
nltk.download('stopwords')
stop_words = stopwords.words('english')

# Initialize Flask app
app = Flask(__name__)

# Load the dataset
newsgroups = fetch_20newsgroups(subset='all')

# Create the TF-IDF matrix
vectorizer = TfidfVectorizer(stop_words=stop_words, max_features=1000)
X = vectorizer.fit_transform(newsgroups.data)

# Apply SVD (LSA)
lsa = TruncatedSVD(n_components=100)
X_lsa = lsa.fit_transform(X)

# Search engine function
def search_engine(query):
    # Transform the query into the TF-IDF space
    query_vec = vectorizer.transform([query])
    query_lsa = lsa.transform(query_vec)

    # Compute cosine similarities between the query and all documents
    similarities = cosine_similarity(query_lsa, X_lsa).flatten()

    # Get the top 5 most similar documents
    top_indices = similarities.argsort()[::-1][:5]
    top_similarities = similarities[top_indices]
    top_documents = [newsgroups.data[i] for i in top_indices]

    return top_documents, top_similarities.tolist(), top_indices.tolist()

# Flask routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    documents, similarities, indices = search_engine(query)
    return jsonify({'documents': documents, 'similarities': similarities, 'indices': indices})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)