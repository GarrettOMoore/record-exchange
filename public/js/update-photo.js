console.log("Hello update");

var modal = document.getElementById('updateModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("update-close")[0];

// When the user clicks on the button, open the modal 
btn.addEventListener('click', function() {
    console.log('clicccckkkk');
    modal.style.display = "block";
})


// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
