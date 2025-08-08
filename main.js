document.addEventListener("DOMContentLoaded", function () {
  document.getElementById('qr-file-input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.getElementById("qr-canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          try {
            const url = new URL(code.data);
            const secret = new URLSearchParams(url.search).get("secret");
            if (secret) {
              document.getElementById("secret-key-input").value = secret;
              generateOTP(secret);
            } else {
              alert("QR కోడ్ లో సీక్రెట్ కనబడలేదు.");
            }
          } catch (e) {
            alert("QR డేటా లోపం ఉంది.");
          }
        } else {
          alert("QR కోడ్ detect కాలేదు.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('submit-key-button').addEventListener('click', () => {
    const key = document.getElementById("secret-key-input").value.trim();
    if (key) {
      generateOTP(key);
    } else {
      alert("దయచేసి సీక్రెట్ కీని ఎంటర్ చేయండి.");
    }
  });

  let otpInterval;

  function generateOTP(secret) {
    clearInterval(otpInterval);
    const otpDisplay = document.getElementById("otp-value");
    const bar = document.getElementById("otp-timer-bar");

    function updateOTP() {
      const otp = OTP.totp().getTOTP(secret);
      otpDisplay.textContent = otp;

      let remaining = 30;
      bar.style.width = "100%";
      clearInterval(otpInterval);
      otpInterval = setInterval(() => {
        remaining--;
        bar.style.width = (remaining / 30 * 100) + "%";
        if (remaining <= 0) {
          updateOTP();
        }
      }, 1000);
    }

    updateOTP();
  }
});
