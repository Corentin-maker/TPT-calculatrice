// Sélection des cases à cocher
const forfaitOui = document.getElementById('forfait_oui');
const forfaitNon = document.getElementById('forfait_non');

// Fonction pour gérer l'exclusivité des cases
function handleCheckboxChange(event) {
    const clickedCheckbox = event.target;
    
    // Si on coche "oui", on décoche "non"
    if (clickedCheckbox === forfaitOui && clickedCheckbox.checked) {
        forfaitNon.checked = false;
    }
    
    // Si on coche "non", on décoche "oui"
    if (clickedCheckbox === forfaitNon && clickedCheckbox.checked) {
        forfaitOui.checked = false;
    }
}

// Ajout des événements sur les deux cases
forfaitOui.addEventListener('change', handleCheckboxChange);
forfaitNon.addEventListener('change', handleCheckboxChange);