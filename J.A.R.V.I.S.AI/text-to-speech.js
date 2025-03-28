document.addEventListener("DOMContentLoaded", () => {
    const loadingScreen = document.querySelector(".loading-screen")
    const mainContent = document.querySelector("body > *:not(.loading-screen)")
    const ttsText = document.getElementById("tts-text")
    const inputLanguage = document.getElementById("input-language")
    const outputLanguage = document.getElementById("output-language")
    const maleVoice = document.getElementById("male-voice")
    const femaleVoice = document.getElementById("female-voice")
    const translateBtn = document.getElementById("translate-btn")
    const speakBtn = document.getElementById("speak-btn")
    const downloadBtn = document.getElementById("download-btn")
    const visualizerBars = document.querySelectorAll(".visualizer-bar")
    const visualizerTime = document.querySelector(".visualizer-time")
    const historyList = document.querySelector(".history-list")
  
    // Hide all content except the loading screen
    if (mainContent) {
      mainContent.style.display = "none"
    }
  
    // Show loading screen for 2 seconds, then fade out
    setTimeout(() => {
      loadingScreen.style.opacity = "0"
      loadingScreen.style.transition = "opacity 0.5s ease-out"
  
      setTimeout(() => {
        loadingScreen.style.display = "none"
        if (mainContent) {
          mainContent.style.display = ""
        }
      }, 500)
    }, 2000)
  
    // Initialize speech synthesis
    const synth = window.speechSynthesis
    let voices = []
    let isPlaying = false
    let currentUtterance = null
    let animationInterval = null
  
    // Populate voices when available
    function populateVoices() {
      voices = synth.getVoices()
      console.log("Available voices:", voices)
    }
  
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = populateVoices
    }
  
    populateVoices()
    
  
    // Simulate translation (in a real app, this would use a translation API)
    translateBtn.addEventListener("click", () => {
      if (ttsText.value.trim() === "") {
        alert("Please enter some text to translate.")
        return
      }
  
      // Simulate translation processing
      translateBtn.disabled = true
      translateBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
        </svg>
        Translating...
      `
  
      setTimeout(() => {
        // For demo purposes, we'll just keep the same text
        // In a real app, this would be the translated text
  
        translateBtn.disabled = false
        translateBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 8l6 6 6-6"/>
            <path d="M5 16l6 6 6-6"/>
          </svg>
          Translate
        `
  
        // Add to history
        addToHistory(ttsText.value)
  
        // Show success notification
        showNotification("Translation complete!")
      }, 2000)
    })
  
    // Text to speech functionality
    speakBtn.addEventListener("click", () => {
      if (ttsText.value.trim() === "") {
        alert("Please enter some text to speak.")
        return
      }
  
      if (isPlaying) {
        stopSpeaking()
        return
      }
  
      startSpeaking()
    })
  
    function startSpeaking() {
      // Stop any ongoing speech
      synth.cancel()
  
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(ttsText.value)
  
      // Set language
      utterance.lang = outputLanguage.value
  
      // Find appropriate voice based on gender selection
      const gender = maleVoice.checked ? "male" : "female"
  
      // Try to find a voice that matches the language and gender
      let selectedVoice = voices.find(
        (voice) =>
          voice.lang.startsWith(outputLanguage.value.split("-")[0]) &&
          (gender === "male" ? !voice.name.includes("Female") : voice.name.includes("Female")),
      )
  
      // If no matching voice is found, use any voice for that language
      if (!selectedVoice) {
        selectedVoice = voices.find((voice) => voice.lang.startsWith(outputLanguage.value.split("-")[0]))
      }
  
      // If still no voice is found, use the first available voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0]
      }
  
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
  
      // Set other properties
      utterance.rate = 1
      utterance.pitch = 1
  
      // Event handlers
      utterance.onstart = () => {
        isPlaying = true
        speakBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
          Stop
        `
  
        // Start visualizer animation
        startVisualizer()
      }
  
      utterance.onend = () => {
        isPlaying = false
        speakBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
          Speak
        `
  
        // Stop visualizer animation
        stopVisualizer()
  
        // Add to history
        addToHistory(ttsText.value)
      }
  
      utterance.onerror = (event) => {
        console.error("SpeechSynthesis error:", event)
        isPlaying = false
        speakBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
          Speak
        `
  
        // Stop visualizer animation
        stopVisualizer()
      }
  
      // Store the current utterance
      currentUtterance = utterance
  
      // Speak
      synth.speak(utterance)
    }
  
    function stopSpeaking() {
      if (isPlaying) {
        synth.cancel()
        isPlaying = false
        speakBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
          Speak
        `
  
        // Stop visualizer animation
        stopVisualizer()
      }
    }
  
    // Visualizer animation
    function startVisualizer() {
      // Set initial time
      visualizerTime.textContent = "00:00 / 00:10"
  
      const startTime = Date.now()
      let elapsedTime = 0
  
      // Animate bars
      animationInterval = setInterval(() => {
        // Update bars
        visualizerBars.forEach((bar) => {
          const height = Math.floor(Math.random() * 95) + 5
          bar.style.height = `${height}px`
        })
  
        // Update time
        elapsedTime = Math.floor((Date.now() - startTime) / 1000)
        const minutes = Math.floor(elapsedTime / 60)
        const seconds = elapsedTime % 60
        visualizerTime.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} / 00:10`
  
        // Stop after 10 seconds if speech hasn't ended naturally
        if (elapsedTime >= 10) {
          stopSpeaking()
        }
      }, 100)
    }
  
    function stopVisualizer() {
      clearInterval(animationInterval)
  
      // Reset bars
      visualizerBars.forEach((bar) => {
        bar.style.height = "5px"
      })
  
      // Reset time
      visualizerTime.textContent = "00:00 / 00:00"
    }
  
    // Download functionality (simulated)
    downloadBtn.addEventListener("click", () => {
      if (ttsText.value.trim() === "") {
        alert("Please enter some text to convert to speech first.")
        return
      }
  
      // Simulate download process
      downloadBtn.disabled = true
      downloadBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
        </svg>
        Processing...
      `
  
      setTimeout(() => {
        downloadBtn.disabled = false
        downloadBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download
        `
  
        // Show success notification
        showNotification("Audio file downloaded successfully!")
  
        // Add to history
        addToHistory(ttsText.value)
      }, 3000)
    })
  
    // History functionality
    function addToHistory(text) {
      // Create a new history item
      const historyItem = document.createElement("div")
      historyItem.className = "history-item"
  
      // Truncate text if too long
      const displayText = text.length > 50 ? text.substring(0, 50) + "..." : text
  
      historyItem.innerHTML = `
        <div class="history-text">${displayText}</div>
        <div class="history-actions">
          <button class="history-play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
          <button class="history-delete">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `
  
      // Add event listeners
      const playBtn = historyItem.querySelector(".history-play")
      const deleteBtn = historyItem.querySelector(".history-delete")
  
      playBtn.addEventListener("click", () => {
        ttsText.value = text
        startSpeaking()
      })
  
      deleteBtn.addEventListener("click", () => {
        historyItem.remove()
      })
  
      // Add to history list
      historyList.prepend(historyItem)
    }
  
    // Notification system
    function showNotification(message) {
      const notification = document.createElement("div")
      notification.className = "notification"
      notification.textContent = message
  
      // Add styles
      notification.style.position = "fixed"
      notification.style.bottom = "20px"
      notification.style.right = "20px"
      notification.style.background = "var(--primary-color)"
      notification.style.color = "var(--background-dark)"
      notification.style.padding = "15px 20px"
      notification.style.borderRadius = "5px"
      notification.style.boxShadow = "0 0 15px var(--glow-color)"
      notification.style.zIndex = "1000"
      notification.style.opacity = "0"
      notification.style.transform = "translateY(20px)"
      notification.style.transition = "opacity 0.3s ease, transform 0.3s ease"
  
      // Add to body
      document.body.appendChild(notification)
  
      // Show notification
      setTimeout(() => {
        notification.style.opacity = "1"
        notification.style.transform = "translateY(0)"
      }, 10)
  
      // Hide and remove after 3 seconds
      setTimeout(() => {
        notification.style.opacity = "0"
        notification.style.transform = "translateY(20px)"
  
        setTimeout(() => {
          notification.remove()
        }, 300)
      }, 3000)
    }
  })
  
  