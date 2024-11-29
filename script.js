document.addEventListener("DOMContentLoaded", () => {
    const choiceSelect = document.getElementById("choice");
    const linkInput = document.getElementById("link-input");
    const imageInput = document.getElementById("image-input");
    const generateBtn = document.getElementById("generate-btn");
    const qrOutput = document.getElementById("qr-output");
    const qrContainer = document.getElementById("qr-container");
    const downloadBtn = document.getElementById("download-btn");

    let qrCode; // To store the QRCode instance

    // Show relevant input fields based on choice
    choiceSelect.addEventListener("change", () => {
        const choice = choiceSelect.value;
        if (choice === "link") {
            linkInput.classList.remove("hidden");
            imageInput.classList.add("hidden");
        } else if (choice === "image") {
            linkInput.classList.add("hidden");
            imageInput.classList.remove("hidden");
        }
    });

    // Generate QR code
    generateBtn.addEventListener("click", () => {
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
            const reader = new FileReader();
            reader.onload = function () {
                const base64Image = reader.result; // Base64 encoded image
                generateQRCode(base64Image);
            };
            reader.readAsDataURL(imageFile);
        }
    });

    // Function to generate QR code
    function generateQRCode(data) {
        qrCode = new QRCode(qrContainer, {
            text: data,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
        });

        // Wait for QRCode.js to render the QR code
        setTimeout(() => {
            // Find the generated img element
            const qrImg = qrContainer.querySelector("img");

            if (qrImg) {
                // Set the download button href to the QR code image src
                downloadBtn.href = qrImg.src;
                downloadBtn.download = "qr_code.png";
                downloadBtn.classList.remove("hidden");
                qrOutput.style.display = "block";
            } else {
                // If QRCode.js renders a canvas instead
                const qrCanvas = qrContainer.querySelector("canvas");
                if (qrCanvas) {
                    const dataURL = qrCanvas.toDataURL("image/png");
                    downloadBtn.href = dataURL;
                    downloadBtn.download = "qr_code.png";
                    downloadBtn.classList.remove("hidden");
                    qrOutput.style.display = "block";
                } else {
                    alert("Failed to generate QR Code. Please try again.");
                }
            }
        }, 500); // Delay to ensure QR code is rendered
    }
});