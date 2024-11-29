// Initialize variables
const choiceSelect = document.getElementById("choice");
const linkInput = document.getElementById("link-input");
const imageInput = document.getElementById("image-input");
const generateButton = document.getElementById("generate");
const qrContainer = document.getElementById("qr-container");
const downloadButton = document.getElementById("download");
const saveLogsButton = document.getElementById("save-logs");
let logs = [];

// Device Detection
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const body = document.body;

    // Remove any previous device classes
    body.classList.remove('android', 'iphone', 'ipad', 'windows', 'linux', 'macos');

    // Add appropriate class based on device
    if (userAgent.includes('android')) {
        body.classList.add('android');
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        body.classList.add('iphone');
    } else if (userAgent.includes('windows')) {
        body.classList.add('windows');
    } else if (userAgent.includes('linux')) {
        body.classList.add('linux');
    } else if (userAgent.includes('macintosh')) {
        body.classList.add('macos');
    }
}

// Run the device detection when the page loads
window.onload = () => {
    detectDevice();
    choiceSelect.value = "link";
    linkInput.style.display = "block";
    imageInput.style.display = "none";
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

// Log message to console and store it
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
        const qrCode = new QRCode(qrContainer, {
            text: data,
            width: 256,
            height: 256,
            correctLevel: QRCode.CorrectLevel.H // Error correction level
        });

        appendToLogs("QR code generated successfully.");

        // Show the download button
        downloadButton.style.display = "block";

        // Make the QR code image downloadable
        const qrCanvas = qrContainer.querySelector("canvas");
        if (qrCanvas) {
            const qrImageDataUrl = qrCanvas.toDataURL("image/png");

            // Trigger automatic download of the QR code image
            downloadButton.addEventListener("click", () => {
                const link = document.createElement("a");
                link.href = qrImageDataUrl;
                link.download = "qr.png";
                link.click();
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