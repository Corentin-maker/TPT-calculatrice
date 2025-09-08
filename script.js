const tptInput = document.getElementById("tpt_percentage");

tptInput.addEventListener("input", () => {
    let value = parseInt(tptInput.value, 10);

    if (value < 1) {
        tptInput.value = 1;
    } else if (value > 100) {
        tptInput.value = 100;
    }
});
