## Mabox CLI
convert web menjadi teks cli

### Fitur
- navigasi halaman dengan command line
- mengambil teks dari halaman web

### Command Table
| Command | Deskripsi |
| --- | --- |
| help | show available commands |
| convert | convert website to cli, example convert https://id.wikipedia.org | 
| open | Open the links available on the website, list links ordered by sequence numbers 1,2,3 and so on |
| clear | clear terminal |
| next | open the next history |
| prev | open the previous history |


### Kekurangan
- hanya support navigasi dengan GET request
- tidak support interaksi javascript

### Menjalankan Aplikasi
- `pip install -r requirements.txt`
- `python main.py`