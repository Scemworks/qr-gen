// Initialize variables
const choiceSelect = document.getElementById("choice");
const linkInput = document.getElementById("link-input");
const imageInput = document.getElementById("image-input");
const generateButton = document.getElementById("generate");
const qrContainer = document.getElementById("qr-container");
const downloadButton = document.getElementById("download");
const saveLogsButton = document.getElementById("save-logs");
let logs = [];

// Set the default selection when the page loads
window.onload = () => {
    choiceSelect.value = "link"; // Set default to 'link'
    linkInput.style.display = "block"; // Show link input
    imageInput.style.display = "none"; // Hide image input
    downloadButton.style.display = "none"; // Hide download button initially
};

// Show appropriate input based on selection (link or image)
choiceSelect.addEventListener("change", () => {
    if (choiceSelect.value === "link") {
        linkInput.style.display = "block";
        imageInput.style.display = "none";
    } else {
        linkInput.style.display = "none";
        imageInput.style.display = "block";
    }
});

// Log message to console and also store it
function appendToLogs(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    logs.push(logMessage);
}

// Download logs as a .txt file
saveLogsButton.addEventListener("click", () => {
    const logBlob = new Blob(logs, { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(logBlob);
    link.download = "logs.txt";
    link.click();
});

// Upload image to Imgur and get the URL
function uploadImageToImgur(file) {
    appendToLogs("Uploading image to Imgur...");
    const formData = new FormData();
    formData.append("image", file);

    fetch("https://api.imgur.com/3/upload", {
        method: "POST",
        headers: {
            Authorization: "Client-ID 0135aa7981498f3",  // Replace with your Imgur Client ID
        },
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const imageUrl = data.data.link;
            appendToLogs(`Imgur upload success: ${imageUrl}`);
            generateQRCode(imageUrl); // Generate QR code from Imgur image URL
        } else {
            appendToLogs("Imgur upload failed.");
        }
    })
    .catch(error => {
        appendToLogs(`Error uploading image: ${error}`);
    });
}

// Generate QR Code from the data (either link or image URL)
function generateQRCode(data) {
    qrContainer.innerHTML = ""; // Clear previous QR codes

    try {
        // Create a new QR Code instance
        const qrCode = new QRCode(qrContainer, {
            text: data,           // URL or image URL to encode
            width: 256,           // Set the width of the QR Code
            height: 256,          // Set the height of the QR Code
            correctLevel: QRCode.CorrectLevel.H // Set error correction level
        });

        appendToLogs("QR code generated successfully.");

        // Show the download button after QR code generation
        downloadButton.style.display = "block";  // Make the download button visible

        // Make the QR code image downloadable
        const qrCanvas = qrContainer.querySelector("canvas");
        if (qrCanvas) {
            // Get the QR code image data as a base64-encoded PNG
            const qrImageDataUrl = qrCanvas.toDataURL("image/png");

            // Trigger automatic download of the QR code image as 'qr.png'
            downloadButton.addEventListener("click", () => {
                const link = document.createElement("a");
                link.href = qrImageDataUrl;
                link.download = "qr.png";  // Save the QR code as qr.png
                link.click();  // Trigger the download
            });
        } else {
            appendToLogs("Error: No canvas found for QR Code.");
        }
    } catch (error) {
        appendToLogs(`Error generating QR Code: ${error.message}`);
    }
}

// Handle the Generate button click
generateButton.addEventListener("click", () => {
    const choice = choiceSelect.value;

    // Hide download button until QR code is generated
    downloadButton.style.display = "none";  // Hide the button before QR generation

    if (choice === "link") {
        const link = document.getElementById("link").value;
        if (link) {
            appendToLogs("Generating QR code from link...");
            generateQRCode(link);
        } else {
            appendToLogs("Please enter a URL or text.");
        }
    } else if (choice === "image") {
        const imageFile = document.getElementById("image").files[0];
        if (imageFile) {
            appendToLogs("Uploading image...");
            uploadImageToImgur(imageFile);
        } else {
            appendToLogs("Please select an image file.");
        }
    }
});