document.addEventListener("DOMContentLoaded", () => {
    const choiceSelect = document.getElementById("choice");
    const linkInput = document.getElementById("link-input");
    const imageInput = document.getElementById("image-input");
    const generateBtn = document.getElementById("generate-btn");
    const qrContainer = document.getElementById("qr-container");

    // Switch between inputs based on choice
    choiceSelect.addEventListener("change", () => {
        const choice = choiceSelect.value;
        if (choice === "link") {
            linkInput.classList.remove("hidden");
            imageInput.classList.add("hidden");
        } else {
            linkInput.classList.add("hidden");
            imageInput.classList.remove("hidden");
        }
    });

    // Generate QR Code
    generateBtn.addEventListener("click", () => {
        const choice = choiceSelect.value;
        qrContainer.innerHTML = ""; // Clear previous QR code

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
                const base64Image = reader.result;
                generateQRCode(base64Image);
            };
            reader.readAsDataURL(imageFile);
        }
    });

    // Generate QR Code
    function generateQRCode(data) {
        const qrCode = new QRCode(qrContainer, {
            text: data,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
        });
    }
});