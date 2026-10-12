from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/api/search")
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"results": []})
    try:
        r = requests.get(
            "https://itunes.apple.com/search",
            params={"term": q, "entity": "song", "limit": 25, "media": "music"},
            timeout=12,
        )
        r.raise_for_status()
        songs = []
        for x in r.json().get("results", []):
            if x.get("previewUrl"):
                songs.append({
                    "id": x.get("trackId"),
                    "title": x.get("trackName", "Unknown title"),
                    "artist": x.get("artistName", "Unknown artist"),
                    "album": x.get("collectionName", ""),
                    "artwork": x.get("artworkUrl100", ""),
                    "preview": x["previewUrl"],
                })
        return jsonify({"results": songs})
    except requests.RequestException:
        return jsonify({"error": "Pencarian sedang bermasalah. Coba lagi nanti."}), 502

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
