
const wordLimitSlider = document.getElementById("wordLimit");
const wordLimitValue = document.getElementById("wordLimitValue");
const output = document.getElementById("output");

const BACKEND_URL = "http://localhost:3000";

wordLimitSlider.addEventListener("input", () => {
    wordLimitValue.textContent = wordLimitSlider.value;
});

async function generateResponse() {
    const input = document.getElementById("userInput").value.trim();
    const wordLimit = Number(wordLimitSlider.value);

    if (!input) {
        output.textContent = "Please enter some text.";
        return;
    }

    output.textContent = "Generating...";

    try {
        const response = await fetch(`${BACKEND_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                input,
                wordLimit,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        output.textContent = data.result;

    } catch (error) {
        console.error(error);
        output.textContent =
            "Unable to generate text. Please check your connection and try again.";
    }
}
