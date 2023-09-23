var idButton = document.getElementById("id-button");
if(idButton != null){
    idButton.addEventListener("click", idClickSubmit);
}

function idClickSubmit()
{
    var userId = document.getElementById("user-id").value;
    const confirmed = confirm("Please click 'OK' to confirm that '" + userId + "' is your correct MTurk ID. If it isn't correct, please click 'cancel' and re-enter it. This must be correct in order for us to pay you for your time!");

    console.log(confirmed);
    if(confirmed){
        window.close();
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {"message": "submitted_valid_id", "user_id": userId});
        });
    }
}