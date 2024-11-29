const imgurClientId = "0135aa7981498f3"; // Replace with your Imgur Client ID
const choiceSelect = document.getElementById("choice");
const linkInput = document.getElementById("link-input");
const imageInput = document.getElementById("image-input");
const generateBtn = document.getElementById("generate");
const qrContainer = document.getElementById("qr-container");
const qrOutput = document.getElementById("qr-output");
const downloadBtn = document.getElementById("download");

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

    const response = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
            Authorization: `Client-ID ${imgurClientId}`,
        },
        body: formData,
    });

    if (response.ok) {
        const data = await response.json();
        return data.data.link; // Imgur returns the uploaded image URL
    } else {
        throw new Error("Imgur upload failed");
    }
}

// Generate QR Code
function generateQRCode(data) {
    const qr = new QRCode(qrContainer, {
        text: data,
        width: 256,
        height: 256,
    });

    qrOutput.style.display = "block";
    downloadBtn.classList.remove("hidden");

    // Enable QR Code Download
    setTimeout(() => {
        const canvas = qrContainer.querySelector("canvas");
        const qrImage = canvas.toDataURL("image/png");
        downloadBtn.href = qrImage;
        downloadBtn.download = "qrcode.png";
    }, 500); // Allow time for QR Code rendering
}

// Generate Button Click Handler
generateBtn.addEventListener("click", async () => {
    const choice = choiceSelect.value;
    qrContainer.innerHTML = ""; // Clear the previous QR code
    qrOutput.style.display = "none"; // Hide output initially
    downloadBtn.classList.add("hidden"); // Hide download button initially

    if (choice === "link") {
        const link = document.getElementById("link").value.trim();
        if (!link) {
            alert("Please enter a valid URL or text.");
            return;
        }
        generateQRCode(link);
    } else if (choice === "image") {
        const imageFile = document.getElementById("image").files[0];
        if (!imageFile) {
            alert("Please select an image file.");
            return;
        }

        try {
            const imgurUrl = await uploadToImgur(imageFile); // Upload image to Imgur
            generateQRCode(imgurUrl); // Generate QR code for the uploaded image URL
        } catch (error) {
            alert("Failed to upload image. Please try again.");
        }
    }
});