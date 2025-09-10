// Convertit un nombre décimal de jours en format "Xj Yh Zm" où 1 jour = DJS (en heures et minutes)
function joursToJHM(joursDecimaux) {
    const djsValue = parseFloat(djsInput.value);
    if (isNaN(djsValue) || djsValue <= 0) return `${joursDecimaux.toFixed(2)}j`;
    // DJS en centièmes d'heure (ex : 7.42)
    // On convertit la DJS en heures et minutes
    const djsHeures = Math.floor(djsValue);
    const djsMinutes = Math.round((djsValue - djsHeures) * 60);
    // Total minutes pour 1 jour
    const djsTotalMinutes = djsHeures * 60 + djsMinutes;
    // Conversion
    const jours = Math.floor(joursDecimaux);
    const resteJours = joursDecimaux - jours;
    let totalMinutes = Math.round(resteJours * djsTotalMinutes);
    let heures = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    return `${jours}j ${heures}h ${minutes}m (1j = ${djsHeures}h${djsMinutes > 0 ? ' ' + djsMinutes + 'm' : ''})`;
}

// Remplit les plannings avec la DJS * %TPT
const djsInput = document.getElementById("time_djs");
const tptInput = document.getElementById("tpt_percentage");
const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
const semaine1Radio = document.getElementById("semaine_1");
const semaine2Radio = document.getElementById("semaine_2");
const joursNonTravSection = document.getElementById("jours-non-travailles-section");
const checkboxes1 = Array.from(document.querySelectorAll('.jour-non-travaille'));
const checkboxes2 = Array.from(document.querySelectorAll('.jour-non-travaille-2'));
const checkboxes2Container = document.getElementById('jours-non-travailles-checkboxes-2');
const absences1 = Array.from(document.querySelectorAll('.absence-1'));
const absences2 = Array.from(document.querySelectorAll('.absence-2'));
const absences2Container = document.getElementById('absences-checkboxes-2');
const reparJourn = document.getElementById("repart_journ");







function updateCompteurNonTravailles() {
    const compteur = document.getElementById('compteur-non-travailles');
    const tptValue = parseFloat(tptInput.value);
    let nbJoursOuvres = 5;
    if (semaine2Radio && semaine2Radio.checked) nbJoursOuvres = 10;
    // Compter le nombre de jours d'absence
    let nbAbsences = 0;
    absences1.forEach(cb => { if (cb.checked) nbAbsences++; });
    if (semaine2Radio && semaine2Radio.checked) {
        absences2.forEach(cb => { if (cb.checked) nbAbsences++; });
    }
    // Calcul du quota exact :
    // TPT = taux de temps travaillé, donc jours non travaillés = (jours ouvrés - absences) * (1 - TPT/100)
    let quotaNonTravailles = 0;
    if (!isNaN(tptValue)) {
        quotaNonTravailles = (nbJoursOuvres - nbAbsences) * (1 - tptValue / 100);
    }
    // Compter le nombre de jours non travaillés déjà cochés (hors absences)
    let nbCoches = 0;
    let allCheckboxes = [];
    let allAbsences = [];
    checkboxes1.forEach((cb, i) => {
        allCheckboxes.push(cb);
        allAbsences.push(absences1[i]);
        if (cb.checked && !(absences1[i] && absences1[i].checked)) nbCoches++;
    });
    if (semaine2Radio && semaine2Radio.checked) {
        checkboxes2.forEach((cb, i) => {
            allCheckboxes.push(cb);
            allAbsences.push(absences2[i]);
            if (cb.checked && !(absences2[i] && absences2[i].checked)) nbCoches++;
        });
    }
    let restant = quotaNonTravailles - nbCoches;
    if (restant < 0) restant = 0;
    // Affichage du quota restant en format décimal ET en format jours/heures/minutes
    if (compteur && !isNaN(quotaNonTravailles)) {
        // Affichage décimal
        let txt = `Jours non travaillés restants à positionner : ${restant.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        // Conversion en format 1j 3h 2m
        // On affiche la conversion uniquement si le quota restant est positif
        if (restant > 0) {
            txt += `  |  soit : ${joursToJHM(restant)}`;
        }
        compteur.textContent = txt;
    } else if (compteur) {
        compteur.textContent = '';
    }

    // Sécurisation stricte :
    let nbCochesCourant = 0;
    allCheckboxes.forEach((cb, i) => {
        if (cb.checked && !(allAbsences[i] && allAbsences[i].checked)) nbCochesCourant++;
    });
    allCheckboxes.forEach((cb, i) => {
        if (allAbsences[i] && allAbsences[i].checked) {
            cb.checked = false;
            cb.disabled = true;
        } else {
            if (!cb.checked && nbCochesCourant >= quotaNonTravailles) {
                cb.disabled = true;
            } else {
                cb.disabled = false;
            }
        }
    });
}

function remplirPlanningsAvecTPT() {
    const djsValue = parseFloat(djsInput.value);
    const tptValue = parseFloat(tptInput.value);
    let isJournee = reparJourn && reparJourn.checked;
    let isDeuxSemaines = semaine2Radio && semaine2Radio.checked;
    // Calcul du quota de jours non travaillés
    let joursRestants = 0;
    let joursRestants1 = [];
    let joursRestants2 = [];
    jours.forEach((jour, i) => {
        if (!(absences1[i] && absences1[i].checked)) joursRestants1.push(i);
        if (isDeuxSemaines && !(absences2[i] && absences2[i].checked)) joursRestants2.push(i);
    });
    joursRestants = joursRestants1.length + (isDeuxSemaines ? joursRestants2.length : 0);
    let quotaNonTravailles = 0;
    if (isJournee && !isNaN(tptValue)) {
        quotaNonTravailles = joursRestants - Math.round(joursRestants * tptValue / 100);
    }
    // Vérification du nombre de cases cochées
    let nbCoches = 0;
    checkboxes1.forEach((cb, i) => {
        if (cb.checked && !(absences1[i] && absences1[i].checked)) nbCoches++;
    });
    if (isDeuxSemaines) {
        checkboxes2.forEach((cb, i) => {
            if (cb.checked && !(absences2[i] && absences2[i].checked)) nbCoches++;
        });
    }
    // Affichage d'un avertissement si trop de cases cochées
    let warn = document.getElementById('tpt-warn');
    if (!warn) {
        warn = document.createElement('div');
        warn.id = 'tpt-warn';
        warn.style.color = 'red';
        warn.style.fontWeight = 'bold';
        warn.style.margin = '10px 0';
        tptInput.parentNode.insertBefore(warn, tptInput.nextSibling);
    }
    if (isJournee && nbCoches > quotaNonTravailles) {
        warn.textContent = `Attention : vous avez sélectionné ${nbCoches} jour(s) non travaillé(s), quota autorisé : ${quotaNonTravailles}`;
    } else {
        warn.textContent = '';
    }
    // Mettre à jour le compteur
    updateCompteurNonTravailles();
    // Remplissage du planning
    if (!isNaN(djsValue)) {
        // On calcule le quota de jours non travaillés (décimal)
        const tptValue = parseFloat(tptInput.value);
        let nbJoursOuvres = 5;
        if (semaine2Radio && semaine2Radio.checked) nbJoursOuvres = 10;
        let nbAbsences = 0;
        absences1.forEach(cb => { if (cb.checked) nbAbsences++; });
        if (semaine2Radio && semaine2Radio.checked) {
            absences2.forEach(cb => { if (cb.checked) nbAbsences++; });
        }
        let quotaNonTravailles = 0;
        if (!isNaN(tptValue)) {
            quotaNonTravailles = (nbJoursOuvres - nbAbsences) * (1 - tptValue / 100);
        }
        // On repère les cases à 0 (jours non travaillés)
        let indicesNonTravailles = [];
        checkboxes1.forEach((cb, i) => {
            if (cb.checked && !(absences1[i] && absences1[i].checked)) indicesNonTravailles.push({semaine:1, idx:i});
        });
        if (semaine2Radio && semaine2Radio.checked) {
            checkboxes2.forEach((cb, i) => {
                if (cb.checked && !(absences2[i] && absences2[i].checked)) indicesNonTravailles.push({semaine:2, idx:i});
            });
        }
        // On détermine la partie entière et la partie décimale du quota
        const quotaEntier = Math.floor(quotaNonTravailles);
        const quotaReste = quotaNonTravailles - quotaEntier;
        // Conversion DJS en minutes
        const djsHeures = Math.floor(djsValue);
        const djsMinutes = Math.round((djsValue - djsHeures) * 60);
        const djsTotalMinutes = djsHeures * 60 + djsMinutes;
        // Temps restant à travailler sur la dernière journée non travaillée
        const resteMinutes = Math.round(djsTotalMinutes * (1 - quotaReste));
        const resteHeures = Math.floor(resteMinutes / 60);
        const resteMins = resteMinutes % 60;
        // Semaine 1
        jours.forEach((jour, i) => {
            const cell1 = document.getElementById(`result1-${jour}`);
            if (cell1) {
                if (absences1[i] && absences1[i].checked) {
                    cell1.textContent = "0";
                } else if (isJournee && checkboxes1[i] && checkboxes1[i].checked) {
                    // Si c'est la dernière case à 0 à positionner et qu'il y a une fraction
                    let isLast = false;
                    if (indicesNonTravailles.length > 0 && indicesNonTravailles[indicesNonTravailles.length-1].semaine === 1 && indicesNonTravailles[indicesNonTravailles.length-1].idx === i && quotaReste > 0) {
                        isLast = true;
                    }
                    if (isLast) {
                        cell1.textContent = `${resteHeures}h${resteMins > 0 ? ' ' + resteMins + 'm' : ''}`;
                    } else {
                        cell1.textContent = "0";
                    }
                } else {
                    cell1.textContent = djsValue.toFixed(2);
                }
            }
        });
        // Semaine 2
        jours.forEach((jour, i) => {
            const cell2 = document.getElementById(`result2-${jour}`);
            if (cell2) {
                if (isDeuxSemaines) {
                    if (absences2[i] && absences2[i].checked) {
                        cell2.textContent = "0";
                    } else if (isJournee && checkboxes2[i] && checkboxes2[i].checked) {
                        let isLast = false;
                        if (indicesNonTravailles.length > 0 && indicesNonTravailles[indicesNonTravailles.length-1].semaine === 2 && indicesNonTravailles[indicesNonTravailles.length-1].idx === i && quotaReste > 0) {
                            isLast = true;
                        }
                        if (isLast) {
                            cell2.textContent = `${resteHeures}h${resteMins > 0 ? ' ' + resteMins + 'm' : ''}`;
                        } else {
                            cell2.textContent = "0";
                        }
                    } else {
                        cell2.textContent = djsValue.toFixed(2);
                    }
                } else {
                    cell2.textContent = "";
                }
            }
        });
    } else {
        // Si pas de valeurs, on vide
        jours.forEach(jour => {
            const cell1 = document.getElementById(`result1-${jour}`);
            const cell2 = document.getElementById(`result2-${jour}`);
            if (cell1) cell1.textContent = "";
            if (cell2) cell2.textContent = "";
        });
    }
}
djsInput.addEventListener("input", remplirPlanningsAvecTPT);
tptInput.addEventListener("input", remplirPlanningsAvecTPT);
checkboxes1.forEach(cb => cb.addEventListener("change", remplirPlanningsAvecTPT));
checkboxes2.forEach(cb => cb.addEventListener("change", remplirPlanningsAvecTPT));
absences1.forEach(cb => cb.addEventListener("change", remplirPlanningsAvecTPT));
absences2.forEach(cb => cb.addEventListener("change", remplirPlanningsAvecTPT));
// Afficher/masquer la section d'absences pour la 2e semaine
document.querySelectorAll('input[name="semaines"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
        absences2Container.style.display = semaine2Radio && semaine2Radio.checked ? '' : 'none';
    });
});
// Initialiser l'affichage au chargement
absences2Container.style.display = semaine2Radio && semaine2Radio.checked ? '' : 'none';
djsInput.addEventListener("input", remplirPlanningsAvecTPT);
tptInput.addEventListener("input", remplirPlanningsAvecTPT);
checkboxes1.forEach(cb => cb.addEventListener("change", remplirPlanningsAvecTPT));
checkboxes2.forEach(cb => cb.addEventListener("change", remplirPlanningsAvecTPT));
// Afficher/masquer la section de choix des jours non travaillés
function updateJoursNonTravailSection() {
    let isJournee = reparJourn && reparJourn.checked;
    let isDeuxSemaines = semaine2Radio && semaine2Radio.checked;
    joursNonTravSection.style.display = isJournee ? '' : 'none';
    checkboxes2Container.style.display = (isJournee && isDeuxSemaines) ? '' : 'none';
}
document.querySelectorAll('input[name="repar"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
        updateJoursNonTravailSection();
        remplirPlanningsAvecTPT();
    });
});
document.querySelectorAll('input[name="semaines"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
        updateJoursNonTravailSection();
        remplirPlanningsAvecTPT();
    });
});
// Initialiser l'affichage au chargement
updateJoursNonTravailSection();

djsInput.addEventListener("input", remplirPlanningsAvecTPT);
tptInput.addEventListener("input", remplirPlanningsAvecTPT);
document.querySelectorAll('input[name="repar"]').forEach(function(radio) {
    radio.addEventListener('change', remplirPlanningsAvecTPT);
});

// Remplit au chargement si déjà une valeur
if (djsInput.value && tptInput.value) remplirPlanningsAvecTPT();

// Affiche ou masque le planning de la semaine 2 selon le choix
document.querySelectorAll('input[name="semaines"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
        var section2 = document.getElementById('section-semaine-2');
        if(document.getElementById('semaine_2').checked) {
            section2.style.display = '';
        } else {
            section2.style.display = 'none';
        }
        // Forcer la mise à jour du planning à chaque changement de semaine
        remplirPlanningsAvecTPT();
    });
});
