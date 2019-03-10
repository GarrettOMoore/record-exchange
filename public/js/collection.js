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

