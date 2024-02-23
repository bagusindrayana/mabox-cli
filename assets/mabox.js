let host = document.getElementById('host').innerHTML;
const terminalDiv = document.getElementById('terminal');
const inputLineDiv = document.getElementById('input-line');

const inputField = document.getElementById('input');

let history = [];
let currentIndexHistory = 0;
let historyCommand = [];
let currentIndexHistoryCommand = 0;

let settings = {
    "hideLinks": false
}

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

const delay = ms => new Promise(res => setTimeout(res, ms));

async function processCommand(input) {
    const command = input.trim();
    if(command === "help") {
         //wait 500ms
         await delay(500);
        createTerminalOutput(`
            <a href="https://github.com/bagusindrayana/mabox-cli" target="_blank">Github</a>
            <p>Help</p>
            <span style="color: white;">Available commands:</span>
            <ul>
                <li>help - show available commands</li>
                <li>convert - convert website to cli, example convert https://id.wikipedia.org, use --hide-links to hide available links in website</li>
                <li>open - Open the links available on the website,open [link number], list links ordered by sequence numbers 1,2,3 and so on</li>
                <li>clear - clear terminal</li>
                <li>next - open the next history</li>
                <li>prev - open the previous history</li>
                <li>links - show available links in current website</li>
                <li>forms - show available forms in current website</li>
                <li>submit - submit form, submit [form number] --input=input1=value1&input2=value2</li>
            </ul>
        `);
       
    } else if(command.startsWith("convert")) {
        let url = command.split(' ')[1];
        if(!url) {
            createTerminalOutput(`<span style="color: red;">Invalid url: ${url}</span>`);
        } else {
            const args = getArgs(command);
            if(args.includes("--hide-links")){
                settings.hideLinks = true;
            }
            url = cleanUrl(url);
            await openLink(url).then((v) => {
                if(v){
                    history.push(url);
                    currentIndexHistory = history.length - 1;
                }
            });
            settings.hideLinks = false;
        }
    } else if(command.startsWith("open")) {
        const links = getCurrentLinks();
        const args = getArgs(command);
        if(args.includes("--hide-links")){
            settings.hideLinks = true;
        }
        if (links.length === 0) {
            createTerminalOutput(`<span style="color: red;">No links available</span>`);
        } else {
            //get index
            const index = parseInt(command.split(' ')[1]);
            if (isNaN(index) || index < 1 || index > links.length) {
                createTerminalOutput(`<span style="color: red;">Invalid link index: ${index}</span>`);
            } else {
                let url = links[index - 1]['href'];
                url = cleanUrl(url);
                await openLink(url).then((v) => {
                    if(v){
                        history.push(url);
                        currentIndexHistory = history.length - 1;
                    }
                });
            }
            settings.hideLinks = false;
        }
    } else if(command.startsWith("clear")) {
        terminalDiv.innerHTML = "";
    } else if(command === "next") {
        await handleHistory("next");
    }
    else if(command === "prev") {
        await handleHistory("prev");
    }
    else if(command === "links"){
        await showLink();
    }
    else if(command === "forms"){
        await showForms();
    }
    else if(command.startsWith("submit")){
        const index = parseInt(command.split(' ')[1]);
        await submitForm(command,index);
    }
    else {
        createTerminalOutput(`<span style="color: red;">Command not found: ${command}</span>`);
    }

    return Promise.resolve(true);

}


inputField.focus();
inputField.addEventListener('keydown', handleInput);


function handleInput(event) {
    if (event.key === 'Enter') {
        const input = event.target.value;
        createTerminalOutput(`<span class="green-text">mabox_cli@${host}:</span> ${input}`);
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
            historyCommand.push(input);
            currentIndexHistoryCommand = historyCommand.length;
            
        });
        
    }

    if (event.key === 'ArrowUp') {
        if(historyCommand.length > 0){
            if(currentIndexHistoryCommand > 0){
                currentIndexHistoryCommand--;
            }
            inputField.value = historyCommand[currentIndexHistoryCommand];
        }
    } else if (event.key === 'ArrowDown') {
        if(historyCommand.length > 0){
            if(currentIndexHistoryCommand < historyCommand.length - 1){
                currentIndexHistoryCommand++;
            }
            inputField.value = historyCommand[currentIndexHistoryCommand];
        }
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

async function showLink(){
    const links = getCurrentLinks();

    //wait 500ms
    await delay(500);



    if(links.length > 0){
        let linkList = "<p>Link : </p><span>Use command open [link number] </span><div class='row'>";
        links.forEach((link, index) => {
            linkList += `<div class="column">${index+1} - ${link['text']}</div>`;
        });
        linkList += "</div>";
        createTerminalOutput(linkList);
    }
    return Promise.resolve(true);

}

async function showForms() {
    const forms = getCurrentForms();
    //wait 500ms
    await delay(500);
    if(forms.length > 0){
        let formList = "<p>Form : </p><span>Use command submit [form number] [--input=inputName1=inputValue1&inputName2=inputValue2] </span><table class='table'><thead><tr><th style='width:10px;'>No</th><th>Method</th><th>Action</th><th>Input</th></tr></thead><tbody>";
        forms.forEach((form, index) => {
            let inputList = "<ul>";
            form['inputs'].forEach((input, index) => {
                inputList += `<li>${input['name']} | ${input['type']} | ${input['required']?"required":"nullable"} | ${input['value']}</li>`;
            });
            inputList += "</ul>";
            formList += `<tr><td>${index+1}</td><td>${form['method']}</td><td>${form['action']}</td><td>${inputList}</td></tr>`;
        });
        formList += "</tbody></table>";
        createTerminalOutput(formList);
    }
    return Promise.resolve(true);
}


function getArgs(command) {
    const l = command.split(' ');
    //get args start with --
    const args = l.filter((v) => v.startsWith('--'));
    return args;
}





function getCurrentLinks(){
    const el = document.getElementById('links');
    if(el && el.innerHTML !== ""){
        const raw = el.innerHTML;
        return JSON.parse(raw);
    } else {
        return [];
    }
}

function getCurrentForms(){
    const el = document.getElementById('forms');
    if(el && el.innerHTML !== ""){
        const raw = el.innerHTML;
        return JSON.parse(raw);
    } else {
        return [];
    }

}

async function submitForm(command,index){
    const forms = getCurrentForms();
    if (forms.length === 0){
        createTerminalOutput(`<span style="color: red;">No forms available</span>`);
        return;
    }
    if (index < 1 || index > forms.length){
        createTerminalOutput(`<span style="color: red;">Invalid form index: ${index}</span>`);
        return;
    }
    const form = forms[index - 1];
    const method = form['method'];
    const action = form['action'];
    const inputs = form['inputs'];
    let data = "method=" + method + "&action=" + action + "&";
    const args = getArgs(command);
    let formInput = [];
    if(args.length > 0){
        const textArgs = args[0].replace('--input=','');
        formInput = textArgs.split('&').map((v) => {
            const l = v.split('=');
            return {
                name: l[0],
                value: l[1]
            }
        })
        data += textArgs;
    }

    inputs.forEach((input, index) => {
        if(input['required']){
            const inputName = input['name'];
            const inputIndex = formInput.findIndex((v) => v.name === inputName);
            let inputValue = "";
            if(inputIndex === -1){
                inputValue = input['value'];
            }
            data += `${inputName}=${inputValue}&`;
        }
    });

    const target = cleanUrl(action);
    const response = await fetch(`/submit-form?target=${target}`, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method : "POST",
        body: data
    });
    const jsonData = await response.json();
    if(response.status === 200) {
        let text = jsonData.text;
        //replace /n with <br>
        text = text.replace(/\n/g, "<br>");
        let output = `
        <center>
            <pre>${ jsonData.titleArt }</pre>
        </center>
        <div class="textbox">${text}</div>`;
        let linkList = "";
        if(jsonData.links.length > 0){
            linkList = "<p>Link : </p><span>Use command open [link number] </span><div class='row'>";
            const elLinks = document.getElementById('links');
            elLinks.innerHTML = JSON.stringify(jsonData.links);
            const elForms = document.getElementById('forms');
            elForms.innerHTML = JSON.stringify(jsonData.forms);
            host = jsonData.host;
            document.querySelector('#prompt span').innerHTML = host;

            jsonData.links.forEach((link, index) => {
                linkList += `<div class="column">${index+1} - ${link['text']}</div>`;
            });
            linkList += "</div>";
        }
        output += linkList;
        createTerminalOutput(output);
        history.push(jsonData.url);
        currentIndexHistory = history.length - 1;
        return Promise.resolve(true);
    } else {
        createTerminalOutput(`<span style="color: red;">Failed to open link: ${data.error}</span>`);
    }
    return Promise.resolve(false);

}

function cleanUrl(url){
    if(url == null){
        url = history[currentIndexHistory];
    }
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
    return url;
}

async function openLink(url) {
    if(url.trim() === "") {
        createTerminalOutput(`<span style="color: red;">Invalid url: ${url}</span>`);
        return;
    }

    try {
        url = cleanUrl(url);
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
                const elForms = document.getElementById('forms');
                elForms.innerHTML = JSON.stringify(data.forms);
                host = data.host;
                document.querySelector('#prompt span').innerHTML = host;

                data.links.forEach((link, index) => {
                    linkList += `<div class="column">${index+1} - ${link['text']}</div>`;
                });
                linkList += "</div>";
            }
            if(!settings.hideLinks){
                output += linkList;
            }
            
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
