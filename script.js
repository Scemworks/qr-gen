const imgurClientId = "0135aa7981498f3";

// DOM Elements
const choiceSelect = document.getElementById("choice");
const linkInput = document.getElementById("link-input");
const imageInput = document.getElementById("image-input");
const generateBtn = document.getElementById("generate");
const qrContainer = document.getElementById("qr-container");
const qrOutput = document.getElementById("qr-output");
const downloadBtn = document.getElementById("download");

// Logs container (in memory)
let logs = "";

// Append logs to memory
function appendToLogs(message) {
    const timestamp = new Date().toISOString();
    logs += `[${timestamp}] ${message}\n`;
}

// Save logs to a file
function saveLogs() {
    const blob = new Blob([logs], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "logs.txt";
    a.click();
}

// Show/Hide Input Fields Based on Choice
choiceSelect.addEventListener("change", () => {
    const choice = choiceSelect.value;
    linkInput.style.display = choice === "link" ? "block" : "none";
    imageInput.style.display = choice === "image" ? "block" : "none";
});

// Upload Image to Imgur
async function uploadToImgur(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    const startTime = performance.now(); // Start timing

    try {
        const response = await fetch("https://api.imgur.com/3/image", {
            method: "POST",
            headers: {
                Authorization: `Client-ID ${imgurClientId}`,
            },
            body: formData,
        });

        const endTime = performance.now(); // End timing
        const timeTaken = (endTime - startTime) / 1000;
        appendToLogs(`Imgur upload time: ${timeTaken} seconds`);

        if (!response.ok) {
            const error = await response.json();
            appendToLogs(`Imgur upload failed: ${error.data.error}`);
            throw new Error(error.data.error);
        }

        const data = await response.json();
        appendToLogs(`Imgur upload success: ${data.data.link}`);
        return data.data.link; // The URL of the uploaded image
    } catch (error) {
        console.error("Imgur upload error:", error);
        appendToLogs(`Error uploading image: ${error.message}`);
        alert(`Error uploading image: ${error.message}`);
        throw error;
    }
}

// Generate QR Code
function generateQRCode(data) {
    qrContainer.innerHTML = "";

    try {
        const qr = new QRCode(qrContainer, {
            text: data,
            width: 256,
            height: 256,
        });

        qrOutput.style.display = "block";
        downloadBtn.classList.remove("hidden");

        setTimeout(() => {
            const canvas = qrContainer.querySelector("canvas");
            if (canvas) {
                const qrImage = canvas.toDataURL("image/png");
                downloadBtn.href = qrImage;
                downloadBtn.download = "qrcode.png";
                appendToLogs("QR code generated successfully.");
            }
        }, 500);
    } catch (error) {
        console.error("QR Code generation error:", error);
        appendToLogs(`Error generating QR Code: ${error.message}`);
        alert("Failed to generate QR Code. Please try again.");
    }
}

// Generate Button Click Handler
generateBtn.addEventListener("click", async () => {
    const choice = choiceSelect.value;

    qrOutput.style.display = "none";
    downloadBtn.classList.add("hidden");

    if (choice === "link") {
        const link = document.getElementById("link").value.trim();
        if (!link) {
            alert("Please enter a valid URL or text.");
            return;
        }
        appendToLogs(`Generating QR code for link: ${link}`);
        generateQRCode(link);
    } else if (choice === "image") {
        const imageFile = document.getElementById("image").files[0];
        if (!imageFile) {
            alert("Please select an image file.");
            return;
        }

        try {
            appendToLogs("Uploading image to Imgur...");
            const imgurUrl = await uploadToImgur(imageFile); // Upload image to Imgur
            appendToLogs(`Image URL: ${imgurUrl}`);
            generateQRCode(imgurUrl); // Generate QR code for the uploaded image URL
        } catch (error) {
            appendToLogs("QR Code generation failed.");
        }
    }
});

// Save logs when the user wants to download them
document.getElementById("save-logs").addEventListener("click", saveLogs);