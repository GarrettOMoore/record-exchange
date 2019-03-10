console.log("hello comment");

let comModals;
let btns;

// Get the modal
var comModal = document.getElementById('comModal');

// Get the button that opens the modal
var tradeBtn;

// Get the <span> element that closes the modal
var tradeSpans;

// click event to open modal 

document.addEventListener('DOMContentLoaded', function() {
    tradeBtns = document.querySelectorAll(".move-trade-btn");
    comModals = document.querySelectorAll(".com-modal-content");
    tradeSpans = document.querySelectorAll('.com-close');

    tradeBtns.forEach( (btn,i) => {
        btn.addEventListener('click', function(e){
            console.log("clickcccc")
            let mod = document.getElementById(`comModal${i}`)
            mod.style.display = 'block';
        })
    })
    
    tradeSpans.forEach( (span, i) => {
        span.addEventListener('click', function(e) {
            let mod = document.getElementById(`comModal${i}`)
            mod.style.display = 'none';
        })
    })
})