## Mabox CLI
convert web to stupid CLI

### Features
- extract and convert website content to text
- navigate webpage trhough links

### Command Table
| Command | Deskripsi |
| --- | --- |
| help | show available commands |
| convert | convert website to cli, example convert https://id.wikipedia.org, use --hide-links to hide available links in website | 
| open | Open the links available on the website,open [link number], list links ordered by sequence numbers 1,2,3 and so on |
| clear | clear terminal |
| next | open the next history |
| prev | open the previous history |
| links | show available links in current website |
| forms | show available forms in current website |
| submit | submit form, submit [form number] --input=input1=value1&input2=value2 |

### Cons
- only support navigate with links / GET request
- not support javascript interaction & SPA/PWA website

### Run Locally
- `pip install -r requirements.txt`
- `python main.py`

### Support

<a href="https://trakteer.id/bagood/tip" target="_blank"><img id="wse-buttons-preview" src="https://cdn.trakteer.id/images/embed/trbtn-red-1.png" height="40" style="border:0px;height:40px;" alt="Trakteer Saya"></a>