from flask import Flask, render_template
import os

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('index.html')


@app.route('/script/<path:filename>')
def get_script(filename):
    data = None
    full_path = os.path.join(os.getcwd(), 'static', 'script', filename)
    try:
        with open(full_path, 'r', encoding='utf-8') as fp:
            data = fp.read()
    except FileNotFoundError as e:
        print(e)
    return data


if __name__ == '__main__':
    app.run()
