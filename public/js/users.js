console.log("Hello user");

let modals;
let imgs;

// Get the modal
var modal = document.getElementById('userModal');

// Get the button that opens the modal
var btn;

// Get the <span> element that closes the modal
var spans;

// click event to open modal 

document.addEventListener('DOMContentLoaded', function() {
    imgs = document.querySelectorAll(".user-pic-box");
    modals = document.querySelectorAll(".new-modal");
    spans = document.querySelectorAll('.user-close');

    imgs.forEach( (img,i) => {
        img.addEventListener('click', function(e){
            console.log(e.target)
            let mod = document.getElementById(`userModal${i}`)
            mod.style.display = 'block';
        })
    })
    
    spans.forEach( (span, i) => {
        span.addEventListener('click', function(e) {
            let mod = document.getElementById(`userModal${i}`)
            mod.style.display = 'none';
        })
    })
})


// close modal on window click
// window.onclick = function(event) {
//     if (event.target == mod) {
//         imgs.forEach( (img,i) => {
//             img.addEventListener('click', function(e){
//                 console.log(e.target)
//                 let mod = document.getElementById(`myModal${i}`);
//                 // console.log(mod)
//                 console.log(mod.style)
//                 mod.style.display = 'none';
//             })
//         })
//     }
// }
