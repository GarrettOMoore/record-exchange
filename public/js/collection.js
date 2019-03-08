console.log("Hello world");

let modals;
let imgs;

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn;

// Get the <span> element that closes the modal
var spans;

// click event to open modal 

document.addEventListener('DOMContentLoaded', function() {
    imgs = document.querySelectorAll(".results-img-box");
    modals = document.querySelectorAll(".modal");
    spans = document.querySelectorAll('.close');

    imgs.forEach( (img,i) => {
        img.addEventListener('click', function(e){
            console.log(e.target)
            let mod = document.getElementById(`myModal${i}`)
            mod.style.display = 'block';
        })
    })
    
    spans.forEach( (span, i) => {
        span.addEventListener('click', function(e) {
            let mod = document.getElementById(`myModal${i}`)
            mod.style.display = 'none';
        })
    })
})


// Modal script for commenting on trade selection //

console.log("Hello comment");

let comModals;
let comImgs;

// Get the modal
var comModal = document.getElementById('comModal');

// Get the button that opens the modal
var comBtn = document.getElementsByClassName('move-trade-btn')[0];

// Get the <span> element that closes the modal
var spans = document.getElementsByClassName('com-close')[0];

// click event to open modal 

comBtn.addEventListener('click', function() {
    console.log('commmeeennntttt clicccckkkk');
    comModal.style.display = "block";
})

spans.onclick = function() {
    console.log('clossseee');
    comModal.style.display = "none";
}
