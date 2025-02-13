document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:4000/api/data")
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById("character-list");
            data.forEach(character => {
                const listItem = document.createElement("li");
                listItem.textContent = `${character.name} - ${character.power}`;
                list.appendChild(listItem);
            });
        })
        .catch(error => console.error("Erreur lors du chargement des données :", error));
});
