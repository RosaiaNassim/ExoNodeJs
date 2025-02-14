fetch("http://127.0.0.1:4001/data")
    .then((response) => response.json())
    .then((episodes) => {
        const container = document.getElementById("episodes-container");

        episodes.forEach((episode) => {
            const episodeCard = document.createElement("div");
            episodeCard.classList.add("episode-card");

            const title = document.createElement("h2");
            title.textContent = episode.title;
            episodeCard.appendChild(title);

            const episodeNumber = document.createElement("p");
            episodeNumber.textContent = `Episode ${episode.episode}`;
            episodeCard.appendChild(episodeNumber);
            container.appendChild(episodeCard);
        });
    })
    .catch((error) =>
        console.error("Erreur lors du chargement du JSON:", error),
    );
console.log("test");
let sceneCount = 1;
function addScene() {
    const scenesDiv = document.getElementById("scenes");
    const sceneDiv = document.createElement("div");
    sceneDiv.classList.add("scene");
    sceneDiv.innerHTML = `
        <label>Image :</label>
        <input type="text" name="scenes[${sceneCount}][image]" required>
        <label>Texte :</label>
        <input type="text" name="scenes[${sceneCount}][text]" required>
    `;
    scenesDiv.appendChild(sceneDiv);
    sceneCount++;
}

document
    .getElementById("episodeForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = {
            episode: document.getElementById("episode").value,
            title: document.getElementById("title").value,
            image: document.getElementById("image").value,
            scenes: [],
        };

        document.querySelectorAll(".scene").forEach((scene, index) => {
            formData.scenes.push({
                image: scene.querySelector(
                    "input[name='scenes[" + index + "][image]']",
                ).value,
                text: scene.querySelector(
                    "input[name='scenes[" + index + "][text]']",
                ).value,
            });
        });

        fetch("http://127.0.0.1:4001/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((result) => {
                if (result.success) {
                    document.getElementById("responseMessage").textContent =
                        "Succès : " + result.message;
                } else {
                    document.getElementById("responseMessage").textContent =
                        "Erreur : " + result.error;
                }
            })
            .catch((error) => {
                document.getElementById("responseMessage").textContent =
                    "Erreur réseau";
            });
    });
