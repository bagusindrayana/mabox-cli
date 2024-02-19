let host = document.getElementById('host').innerHTML;
const terminalDiv = document.getElementById('terminal');
const inputLineDiv = document.getElementById('input-line');

let history = [];
let currentIndexHistory = 0;

//check query sc
const urlParams = new URLSearchParams(window.location.search);
const sc = urlParams.get('sc');
if(sc){
    history.push(sc);
    currentIndexHistory = history.length - 1;
}

function createTerminalOutput(text) {
    const outputDiv = document.createElement('div');
    outputDiv.innerHTML = text; // Use innerHTML to render HTML tags in output
    terminalDiv.appendChild(outputDiv);
    
    
}

async function processCommand(input) {
    const command = input.trim();
    if(command === "help") {
        createTerminalOutput(`
            <span style="color: white;">Available commands:</span>
            <ul>
                <li>help - show available commands</li>
                <li>convert - convert website to cli, example convert https://id.wikipedia.org</li>
                <li>open - Open the links available on the website, list links ordered by sequence numbers 1,2,3 and so on</li>
                <li>clear - clear terminal</li>
                <li>next - open the next history</li>
                <li>prev - open the previous history</li>
            </ul>
        `);
    } else if(command.startsWith("convert")) {
        const url = command.split(' ')[1];
        if(!url) {
            createTerminalOutput(`<span style="color: red;">Invalid url: ${url}</span>`);
        } else {
            await openLink(url).then((v) => {
                if(v){
                    history.push(url);
                    currentIndexHistory = history.length - 1;
                }
            });
        }
    } else if(command.startsWith("open")) {
        const links = getCurrentLinks();
        if (links.length === 0) {
            createTerminalOutput(`<span style="color: red;">No links available</span>`);
        } else {
            //get index
            const index = parseInt(command.split(' ')[1]);
            if (isNaN(index) || index < 1 || index > links.length) {
                createTerminalOutput(`<span style="color: red;">Invalid link index: ${index}</span>`);
            } else {
                const url = links[index - 1]['href'];
                await openLink(url).then((v) => {
                    if(v){
                        history.push(url);
                        currentIndexHistory = history.length - 1;
                    }
                });
            }
        }
    } else if(command.startsWith("clear")) {
        terminalDiv.innerHTML = "";
    } else if(command === "next") {
        await handleHistory("next");
    }
    else if(command === "prev") {
        await handleHistory("prev");
    }
    else {
        createTerminalOutput(`<span style="color: red;">Command not found: ${command}</span>`);
    }

    return Promise.resolve(true);

}

function handleInput(event) {
    if (event.key === 'Enter') {
        const input = event.target.value;
        createTerminalOutput(`<span id="prompt">mabox_cli@${host}:</span> ${input}`);
        //hide input
        inputLineDiv.style.display = 'none';

        processCommand(input).then(() => {
            
            //clear input
            event.target.value = '';
            //show input
            inputLineDiv.style.display = 'flex';
            //focus input
            document.body.scrollTop = document.body.scrollHeight;
            event.target.focus();
            
            
        });
        
    }
}

async function handleHistory(c){
    if (history.length <= 0){
        return Promise.resolve(false);
    }
    if (c == "prev"){
        if (currentIndexHistory > 0){
            currentIndexHistory--;
        }
        
    } else if (c == "next") {
        if (currentIndexHistory < history.length - 1){
            currentIndexHistory++;
        }
    } else {
        return Promise.resolve(false);
    }
    await openLink(history[currentIndexHistory]);
    return Promise.resolve(true);
}

function getArgs(command) {
    const l = command.split(' ');
    //get args start with --
    const args = l.filter((v) => v.startsWith('--'));
    return args;
}

const inputField = document.getElementById('input');
inputField.focus();
inputField.addEventListener('keydown', handleInput);

function getCurrentLinks(){
    const el = document.getElementById('links');
    if(el){
        const raw = el.innerHTML;
        return JSON.parse(raw);
    } else {
        return [];
    }
}

async function openLink(url) {
    if(url.trim() === "") {
        createTerminalOutput(`<span style="color: red;">Invalid url: ${url}</span>`);
        return;
    }

    try {
        //if link start with ./ or /
        if((url.startsWith('./') || url.startsWith('/')) && !url.startsWith('//')) {
            url = `http://${host}${url.replace("./","/")}`;
        }

        //if link doesnt have http
        if(!url.startsWith('http')) {
            if(url.startsWith('//')){
                url = `http:${url}`;
            } else {
                url = `http://${url}`;
            }
        }
        const response = await fetch(`/open-link?url=${url}`);
        const data = await response.json();
        if(response.status === 200) {
            let text = data.text;
            //replace /n with <br>
            text = text.replace(/\n/g, "<br>");
            let output = `
            <center>
                <pre>${ data.titleArt }</pre>
            </center>
            <div class="textbox">${text}</div>`;
            let linkList = "";
            if(data.links.length > 0){
                linkList = "<p>Link : </p><span>Use command open [link number] </span><div class='row'>";
                const elLinks = document.getElementById('links');
                elLinks.innerHTML = JSON.stringify(data.links);
                host = data.host;
                document.querySelector('#prompt span').innerHTML = host;

                data.links.forEach((link, index) => {
                    linkList += `<div class="column">${index+1} - ${link['text']}</div>`;
                });
                linkList += "</div>";
            }
            output += linkList;
            createTerminalOutput(output);
            return Promise.resolve(true);
        } else {
            createTerminalOutput(`<span style="color: red;">Failed to open link: ${data.error}</span>`);
        }
    } catch (error) {
        createTerminalOutput(`<span style="color: red;">Failed to open link: ${error}</span>`);
    }
    return Promise.resolve(false);
}
