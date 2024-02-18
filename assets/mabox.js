let host = document.getElementById('host').innerHTML;
const terminalDiv = document.getElementById('terminal');
const inputLineDiv = document.getElementById('input-line');

function createTerminalOutput(text) {
    const outputDiv = document.createElement('div');
    outputDiv.innerHTML = text; // Use innerHTML to render HTML tags in output
    terminalDiv.appendChild(outputDiv);
    
    
}

async function processCommand(input) {
    const command = input.trim();

    // if (command === 'hello') {
    //     createTerminalOutput('<span style="color: blue;">Hello there!</span>');
    // } else if (command === 'date') {
    //     createTerminalOutput(`<span style="color: yellow;">${new Date().toLocaleString()}</span>`);
    // } else {
    //     createTerminalOutput(`<span style="color: red;">Command not found: ${command}</span>`);
    // }

    if(command === "help") {
        createTerminalOutput(`
            <span style="color: white;">Available commands:</span>
            <ul>
                <li>help - show available commands</li>
                <li>convert - convert website to cli, example conver https://id.wikipedia.org</li>
                <li>open - Open the links available on the website, the links are opened in the sequence numbers 1,2,3 and so on</li>
            </ul>
        `);
    } else if(command.startsWith("convert")) {
        const url = command.split(' ')[1];
        if(!url) {
            createTerminalOutput(`<span style="color: red;">Invalid url: ${url}</span>`);
        } else {
            await openLink(url);
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
                await openLink(links[index - 1]['href']);
            }
        }
    } else {
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
    //if link start with ./ or /
    if(url.startsWith('./') || url.startsWith('/')) {
        url = `http://${host}${url.replace("./","/")}`;
    }

    try {
        const response = await fetch(`/open-link?url=${url}`);
        const data = await response.json();
        if(response.status === 200) {
            let output = `
            <center>
                <pre>${ data.titleArt }</pre>
            </center>
            <div class="textbox">${data.text}</div>`;
            let linkList = "";
            if(data.links.length > 0){
                linkList = "<p>Link : </p><ol>";
                const elLinks = document.getElementById('links');
                elLinks.innerHTML = JSON.stringify(data.links);
                host = data.host;

                data.links.forEach((link, index) => {
                    linkList += `<li>${link['text']}</li>`;
                });
                linkList += "</ol>";
            }
            output += linkList;
            createTerminalOutput(output);
        } else {
            createTerminalOutput(`<span style="color: red;">Failed to open link: ${data.error}</span>`);
        }
    } catch (error) {
        createTerminalOutput(`<span style="color: red;">Failed to open link: ${error}</span>`);
    }
}
