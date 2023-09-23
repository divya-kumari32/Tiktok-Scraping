chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.message === "submitted_valid_id") {
            if(!document.getElementById('progressBarContainer')){
                createProgressBar();
            }
            // create first set of survey
            createSurvey(request.user_id);
            // add FAQ overlay
            createOverlay();
            observe(request.user_id);
        }
    }
);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function observe(userId)
{
    let intersectOptions = {
        root: document.querySelector("#scrollArea"),
        rootMargin: "0px",
        threshold: 0.9, // maybe less
      };

    // Send data of video that is on screen
    const intersectCallback = (entries, observer) => {
        entries.forEach(async(entry) => {
            //console.log(entry);
            if(entry.isIntersecting)
            {
                if(entry.target.nextSibling != null && entry.target.localName !== 'svg'){
                    observer.unobserve(entry.target);

                    var timestamp = Date.now();

                    var caption = "";

                    var vidDescElem = entry.target.querySelector("[data-e2e='video-desc']");

                    var children = vidDescElem.children;
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if(child.nodeName === "A")
                        {
                            caption += child.children[0].innerText;
                        }else if(child.nodeName === "SPAN")
                        {
                            caption += child.innerText;
                        }
                    }

                    console.log("caption: " + caption);

                    var author = entry.target.querySelector("[data-e2e='video-author-uniqueid']").textContent;

                    await sleep(1000);
                    var vidTag = document.getElementsByTagName("video")[0];
                    var vidId = vidTag.parentElement.id.split('-')[2];

                    // var divplayer = entry.target.querySelector("[class*='DivVideoPlayerContainer']");
                    // console.log(divplayer);
                    // var vidTag = divplayer.getElementsByTagName("video")[0];
                    // var vidId = vidTag.parentElement.id.split('-')[2];
                    

                    var formatVideoSite = "https://www.tiktok.com/";
                    var videoSiteFinal = formatVideoSite.concat("@", author, "/video/", vidId);

                    const req = new XMLHttpRequest();
                    const baseUrl = "https://lyifhfxvnf.execute-api.us-west-2.amazonaws.com/test/tiktok";
                    const urlParams = `{\n \"is_user_answer\": false, \n \"user_id\": \"${userId}\",\n \"author\": \"${author}\",\n \"video_id\": \"${vidId}\",\n \"video_link\": \"${videoSiteFinal}\",\n \"submit_time\": ${timestamp},\n \"caption\": \"${caption}\" \n}`;   
                    console.log("urlparams: " + urlParams);
                    req.open("POST", baseUrl, true);
                    req.setRequestHeader("Access-Control-Allow-Origin", "*");
                    req.send(JSON.stringify({"body": `${urlParams}`}));

                    req.onreadystatechange = function() { // Call a function when the state changes.
                        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                            console.log("Got response 200!");
                        }
                    }
                }
            }
        });
    };
      
    let intersectTarget = document.querySelectorAll("[data-e2e='recommend-list-item-container']");
    let intersectObserver = new IntersectionObserver(intersectCallback, intersectOptions);
    for(let elem of intersectTarget)
    {
        intersectObserver.observe(elem);
    }

    const mutationTarget = document.querySelector("[class*='DivOneColumnContainer']");
    const mutationConfig = { attributes: false, childList: true, subtree: false };

    // Callback function for when new videos are added to the DOM
    const mutationCallback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            createSurvey(userId);
            if(mutation.addedNodes.length > 0)
            {
                intersectObserver.observe(mutation.addedNodes[0]);
            }
        }
    };

    const mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(mutationTarget, mutationConfig);
    
}

var submitCount = 0;
var totalCount = 20;
var progressB, progressL;

// Create the progress bar
function createProgressBar() {
    
    var headerDiv = document.querySelector("[class*='DivHeaderWrapperMain']").children[1];
    container = document.createElement("div");
    container.setAttribute("id", "progressBarContainer");
    container.style.width = "50vh";

    var logo = document.createElement('img');
    logo.src = chrome.runtime.getURL("images/icon-16.png");
    logo.style.display = "inline-block";
    logo.style.height = "4vh";
    logo.style.marginLeft = "30%";
    logo.style.verticalAlign = "middle";

    var progressBar = document.createElement("progress");
    progressBar.setAttribute("id", "progressBar");
    progressBar.setAttribute("value", "0");
    progressBar.setAttribute("max", "100");
    progressBar.style.display = "inline-block";
    progressBar.style.verticalAlign = "middle";
    progressBar.style.marginTop = "2%";
    progressBar.style.marginLeft = "10px";

    var progressLabel = document.createElement("span");
    progressLabel.setAttribute("id", "progressLabel");
    progressLabel.style.display = "inline-block";
    progressLabel.style.verticalAlign = "middle";
    progressLabel.style.marginLeft = "10px";
    progressLabel.style.marginTop = "8px";
    progressLabel.innerHTML = `${submitCount}/${totalCount}`
    
    container.appendChild(logo);
    container.appendChild(progressBar);
    container.appendChild(progressLabel);
    headerDiv.appendChild(container);

}

function createSurvey(userId) {
    var elements = document.querySelectorAll("[data-e2e='recommend-list-item-container']");
    var vidCount = 0;

    for(let item of elements){
        var videoWrapper = item.childNodes[1].childNodes[1];
        if(videoWrapper.lastChild.className != "survey"){
            // Display the survey
            var survey = document.createElement('div');
            survey.className = "survey";
            survey.style.marginBottom = "40%";

            // Question 1:
            var q1 = document.createElement('p');
            q1.textContent = "Do you think this video is:";
            q1.style.fontWeight = "bold";

            let radioInputExp = document.createElement("input");
            radioInputExp.type = "radio";
            radioInputExp.id = "exp" + vidCount;
            radioInputExp.name = "policheck" + vidCount;
            radioInputExp.value = "Explicitly political";
            let radioLabelExp = document.createElement("label");
            radioLabelExp.innerText = " Explicitly political";
            radioLabelExp.for = "exp" + vidCount;

            let radioInputImp = document.createElement("input");
            radioInputImp.type = "radio";
            radioInputImp.id = "imp" + vidCount;
            radioInputImp.name = "policheck" + vidCount;
            radioInputImp.value = "Implicitly political";
            let radioLabelImp = document.createElement("label");
            radioLabelImp.innerText = " Implicitly political";
            radioLabelImp.for = "imp" + vidCount;

            let radioInputNeither = document.createElement("input");
            radioInputNeither.type = "radio";
            radioInputNeither.id = "nei" + vidCount;
            radioInputNeither.name = "policheck" + vidCount;
            radioInputNeither.value = "Neither";
            let radioLabelNeither = document.createElement("label");
            radioLabelNeither.innerText = " Neither";
            radioLabelNeither.for = "nei" + vidCount;

            // Question 2:
            var q2 = document.createElement('p');
            q2.textContent = "In a few words, please explain your choice:";
            q2.style.fontWeight = "bold";

            var whyTextArea = document.createElement('textarea');
            whyTextArea.name = "textarea";
            whyTextArea.id = "vidtext" + vidCount;
            whyTextArea.rows = "3";
            whyTextArea.cols = "25";
            whyTextArea.style.border = "2px solid black";

            // Create a submit button
            var submitButton = document.createElement('button');
            submitButton.id = "btn" + vidCount;
            submitButton.type = "submit";
            submitButton.textContent = "Submit";
            submitButton.style.cursor = 'pointer';
            submitButton.style.background='#D3D3D3';
            submitButton.style.borderRadius = '5px';

            submitButton.addEventListener('click', function(e) {
                handleSubmitClick(e, userId);
            });

            survey.appendChild(q1);
            survey.appendChild(radioInputExp);
            survey.appendChild(radioLabelExp);
            survey.appendChild(document.createElement('br'));
            survey.appendChild(radioInputImp);
            survey.appendChild(radioLabelImp);
            survey.appendChild(document.createElement('br'));
            survey.appendChild(radioInputNeither);
            survey.appendChild(radioLabelNeither);
            survey.appendChild(document.createElement('br'));
            survey.appendChild(document.createElement('br'));
            survey.appendChild(q2);
            survey.appendChild(whyTextArea);
            survey.appendChild(document.createElement('br'));
            survey.appendChild(submitButton);
            videoWrapper.appendChild(survey);
        }
        vidCount += 1;
    }
}

function handleSubmitClick(e, userId)
{
    var vidIdNum = e.target.id.substring(3);

    // Get answer to "Which video category?"
    var radioIdString = "policheck" + vidIdNum;
    var radioQuery = "input[name='" + radioIdString + "']:checked";

    var radioCheckSelect = document.querySelector(radioQuery);
    var radioCheck = null;
    if(radioCheckSelect != null)
    {
        radioCheck = radioCheckSelect.value;
    }else
    {
        alert('Please fill out the survey before clicking submit!');
        return;
    }

    submitCount += 1;
    var timestamp = Date.now();
    // Change the submit button text and style
    var sButton = e.target;
    sButton.innerHTML = "&#10003; Done";
    sButton.style.color = "green";
    sButton.style.border = "none";

    if(submitCount <= totalCount){
        // Update progress bar value
        var progressBar = document.getElementById("progressBar");
        progressBar.value = (submitCount/totalCount) * 100;

        var progressLabel = document.getElementById("progressLabel");
        progressLabel.innerHTML = `${submitCount}/${totalCount}`;
    } else {
        var progressLabel = document.getElementById("progressLabel");
        progressLabel.innerHTML = `${totalCount}/${totalCount}`;
    }

    // Get text from "why?" textarea question
    var respString = "vidtext" + vidIdNum;
    var message = document.getElementById(respString).value;

    // Making assumption that the current video is playing when it's submit button is clicked
    var vidTag = document.getElementsByTagName("video")[0];
    var vidId = vidTag.parentElement.id.split('-')[2];

    var author = e.target.parentElement.parentElement.parentElement.parentElement
                .querySelector("[data-e2e='video-author-uniqueid']").textContent;

    var formatVideoSite = "https://www.tiktok.com/";
    var videoSiteFinal = formatVideoSite.concat("@", author, "/video/", vidId);

    const req = new XMLHttpRequest();
    const baseUrl = "https://lyifhfxvnf.execute-api.us-west-2.amazonaws.com/test/tiktok";
    const urlParams = `{\n \"is_user_answer\": true, \n \"user_id\": \"${userId}\",\n \"political\": \"${radioCheck}\",\n \"why\": \"${message}\",\n \"author\": \"${author}\",\n \"video_id\": \"${vidId}\",\n \"video_link\": \"${videoSiteFinal}\",\n \"submit_time\": ${timestamp}\n, \"session_vid_num\": ${parseInt(vidIdNum)}\n}`;    
    console.log("urlparams: " + urlParams);
    req.open("POST", baseUrl, true);
    req.setRequestHeader("Access-Control-Allow-Origin", "*");
    req.send(JSON.stringify({"body": `${urlParams}`}));

    req.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log("Got response 200!");
        }
    }
}

// Create the FAQ overlay
function createOverlay()
{
    var divBottom = document.querySelector('div[class*="DivBottomContainer"]');

    var logo = document.createElement('img');
    logo.src = chrome.runtime.getURL("images/icon-16.png");

    // Create outer box of overlay
    let instructionBox = document.createElement('div');
    instructionBox.style.width = '300px';
    instructionBox.style.height = '200px';
    instructionBox.style.color = 'black';
    instructionBox.style.background = 'white';
    instructionBox.style.padding = '20px';
    instructionBox.style.marginBottom = '5px';
    instructionBox.style.borderRadius = '25px';
    instructionBox.style.border = '2px solid black';
    instructionBox.style.overflow = 'auto';

    let close = document.createElement('button');
    close.textContent = 'x';
    close.style.float = 'right';
    close.style.outline = 'none';
    close.style.border = 'none';
    close.style.cursor = 'pointer';
    close.style.backgroundColor = 'transparent';

    close.addEventListener('click', function(e) {
        instructionBox.style.display = 'none';
    });

    let header = document.createElement('p');
    header.textContent = "FAQ:";
    header.style.fontWeight = "bold";
    header.style.fontSize = '25px';

    let q1 = document.createElement('p');
    q1.textContent = 'Q: What do the ratings "explicitly political" and "implicitly political" mean?';
    q1.style.fontWeight = "bold";
    
    let a1 = document.createElement('p');
    a1.textContent = 'A: Whatever these terms mean to you! We are just interested in 1. whether you think the TikTok is political, and 2. the extent to which you find it political.';
    
    let q2 = document.createElement('p');
    q2.textContent = 'Q: Are there limits to how many videos I can view for this study?';
    q2.style.fontWeight = "bold";

    let a2 = document.createElement('p');
    a2.textContent = 'A: No! There is no limit to the number of answers you can submit. However, you are only paid for full answers on videos until the progress bar is completely filled. You can continue to submit answers, but will not be paid for more than the limit.';

    instructionBox.appendChild(close);
    instructionBox.appendChild(logo);
    instructionBox.appendChild(header);
    instructionBox.appendChild(q1);
    instructionBox.appendChild(a1);
    instructionBox.appendChild(q2);
    instructionBox.appendChild(a2);
    divBottom.insertBefore(instructionBox, divBottom.firstChild);
    
}