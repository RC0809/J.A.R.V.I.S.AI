document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form")
  const loginBtn = document.querySelector(".login-btn")
  const fingerprint = document.querySelector(".fingerprint")

  // Simulate biometric scanning
  fingerprint.addEventListener("click", () => {
    fingerprint.style.opacity = "1"
    simulateBiometricScan()
  })

  // Login form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()
    simulateLogin()
  })

  // Simulate biometric scanning
  function simulateBiometricScan() {
    const scanDuration = 2000 // 2 seconds
    const scanLine = document.querySelector(".scan-line")

    // Add scanning animation
    scanLine.style.animation = "none"
    scanLine.offsetHeight // Trigger reflow
    scanLine.style.animation = "scanLine 2s linear infinite"

    setTimeout(() => {
      // Simulate successful scan
      fingerprint.style.borderColor = "var(--success-color)"
      fingerprint.style.boxShadow = "0 0 20px var(--success-color)"

      // Reset after animation
      setTimeout(() => {
        fingerprint.style.opacity = "0.5"
        fingerprint.style.borderColor = "var(--primary-color)"
        fingerprint.style.boxShadow = "none"
      }, 1000)
    }, scanDuration)
  }

  // Simulate login process
  function simulateLogin() {
    loginBtn.disabled = true
    loginBtn.innerHTML = "AUTHENTICATING..."

    // Add loading animation
    loginBtn.style.background = "linear-gradient(90deg, var(--primary-color) 50%, transparent 50%)"
    loginBtn.style.backgroundSize = "200% 100%"
    loginBtn.style.animation = "loading 2s linear infinite"

    setTimeout(() => {
      // Simulate successful login
      loginBtn.style.background = "var(--success-color)"
      loginBtn.innerHTML = "ACCESS GRANTED"

      // Redirect to main page
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1000)
    }, 3000)
  }

  // Alternative login options
  const loginOptions = document.querySelectorAll(".login-option")
  loginOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.preventDefault()
      const provider = option.classList[1] // Get the provider class (phone, google, microsoft, apple)
      simulateAlternativeLogin(provider)
    })
  })

  function simulateAlternativeLogin(provider) {
    const button = document.querySelector(`.login-option.${provider}`)
    const originalText = button.textContent

    button.disabled = true
    button.textContent = "Connecting..."

    setTimeout(() => {
      button.textContent = "Authenticating..."

      setTimeout(() => {
        button.style.background = "var(--success-color)"
        button.textContent = "Success!"

        setTimeout(() => {
          window.location.href = "index.html"
        }, 1000)
      }, 2000)
    }, 2000)
  }
})

// Add this to your existing CSS
document.head.insertAdjacentHTML(
  "beforeend",
  `
      <style>
          @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
          }
      </style>
  `,
)

