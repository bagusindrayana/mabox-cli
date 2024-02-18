import os
import re
import requests as req
from flask import Flask, request, jsonify,render_template
from flask_cors import CORS
from bs4 import BeautifulSoup
from art import *


app = Flask(__name__, template_folder='templates', static_folder='assets')
CORS(app)


def convertWebsiteToText(url):
    # request to url and convert to text
    try:
        
        response = req.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        # get title
        title = soup.title.string
        links = []
        # get text from website, but keep newline
        for a in soup.find_all('a'):
            if a.get_text().strip() != "":
                links.append({
                    "href": a.get("href"),
                    "text": a.get_text()
                })
            a.replace_with(" ")
            
        text = soup.get_text("\n", strip=True)
        # # replace newline with <br> tag
        # text = text.replace("\n", "<br>")
        titleArt=text2art(title)
        # titleArt = titleArt.replace("\n", "<br>")
        m = re.search('https?://([A-Za-z_0-9.-]+).*', url)
        if m:
            host = m.group(1).replace("www.", "")
        else:
            host = url
        return {
            "host": host,
            "title" : title,
            "titleArt" : titleArt,
            "text": text,
            "links": links
        }
    except Exception as e:
        return {
            "error": str(e)
        }


@app.route('/')
def index():
    # get sc query
    sc = request.args.get("sc")
    data = None
    error = None
    if sc is not None:
        # convert sc to text
        res = convertWebsiteToText(sc)
 
        if "error" in res:
            error = res["error"]
        else:
            
            data = {
                "host":res['host'] ,
                "title": res['title'],
                "titleArt": res['titleArt'],
                "text": res['text'],
                "links": res['links']
            }
            print(data)
    return render_template('index.html',data=data,error=error)

@app.route('/open-link')
def openLink():
    url = request.args.get("url")
    return jsonify(convertWebsiteToText(url))



if __name__ == '__main__':
    config = {
        'host': '0.0.0.0',
        'port': os.getenv("PORT", default=5001),
        'debug': True
    }

    app.run(**config)