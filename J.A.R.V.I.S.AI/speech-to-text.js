document.addEventListener("DOMContentLoaded", () => {
    const loadingScreen = document.querySelector(".loading-screen")
    const mainContent = document.querySelector("body > *:not(.loading-screen)")
    const startRecordingBtn = document.getElementById("start-recording-btn")
    const playBtn = document.getElementById("play-btn")
    const downloadBtn = document.getElementById("download-btn")
    const copyBtn = document.getElementById("copy-btn")
    const inputLanguage = document.getElementById("input-language")
    const outputLanguage = document.getElementById("output-language")
    const maleVoice = document.getElementById("male-voice")
    const femaleVoice = document.getElementById("female-voice")
    const visualizerBars = document.querySelectorAll(".visualizer-bar")
    const visualizerTime = document.querySelector(".visualizer-time")
    const sttResult = document.getElementById("stt-result")
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
  
    // Speech recognition variables
    let recognition
    let isRecording = false
    let recordingStartTime
    let recordingInterval
    let currentTranscript = ""
    const audioBlob = null
  
    // Initialize speech recognition if available
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
    } else {
      // Speech recognition not supported
      startRecordingBtn.disabled = true
      showNotification("Speech recognition is not supported in your browser.", "error")
    }
  
    // Initialize speech synthesis
    const synth = window.speechSynthesis
    let voices = []
  
    // Populate voices when available
    function populateVoices() {
      voices = synth.getVoices()
    }
  
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = populateVoices
    }
  
    populateVoices()
  
    // Start/stop recording
    startRecordingBtn.addEventListener("click", () => {
      if (!isRecording) {
        startRecording()
      } else {
        stopRecording()
      }
    })
  
    // Play transcribed text
    playBtn.addEventListener("click", () => {
      if (currentTranscript) {
        speakText(currentTranscript)
      }
    })
  
    // Download transcription
    downloadBtn.addEventListener("click", () => {
      if (currentTranscript) {
        downloadTranscription()
      }
    })
  
    // Copy transcription to clipboard
    copyBtn.addEventListener("click", () => {
      if (currentTranscript) {
        copyToClipboard()
      }
    })
  
    // Start recording function
    function startRecording() {
      if (!recognition) return
  
      // Clear previous results
      currentTranscript = ""
      sttResult.innerHTML = '<div class="stt-placeholder">Listening...</div>'
  
      // Set recognition language
      recognition.lang = inputLanguage.value
  
      // Set up recognition event handlers
      recognition.onstart = () => {
        isRecording = true
        startRecordingBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
          Stop Recording
        `
        startRecordingBtn.classList.remove("primary")
        startRecordingBtn.style.background = "var(--error-color)"
  
        // Start visualizer animation
        startVisualizer()
  
        // Record start time
        recordingStartTime = Date.now()
  
        // Update timer
        recordingInterval = setInterval(updateRecordingTime, 1000)
      }
  
      recognition.onresult = (event) => {
        let interimTranscript = ""
        let finalTranscript = ""
  
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
  
        // Update current transcript
        currentTranscript = finalTranscript || interimTranscript
  
        // Display transcript
        sttResult.innerHTML = `
          <div>${finalTranscript}</div>
          <div style="opacity: 0.7; font-style: italic;">${interimTranscript}</div>
        `
  
        // Enable buttons if we have content
        if (currentTranscript) {
          playBtn.disabled = false
          downloadBtn.disabled = false
          copyBtn.disabled = false
        }
      }
  
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        stopRecording()
        showNotification(`Error: ${event.error}`, "error")
      }
  
      recognition.onend = () => {
        // If we're still in recording state, restart recognition
        // (this can happen if recognition stops unexpectedly)
        if (isRecording) {
          recognition.start()
        }
      }
  
      // Start recognition
      try {
        recognition.start()
      } catch (error) {
        console.error("Recognition start error:", error)
        showNotification("Failed to start speech recognition.", "error")
      }
    }
  
    // Stop recording function
    function stopRecording() {
      if (!recognition) return
  
      isRecording = false
  
      // Stop recognition
      recognition.stop()
  
      // Update UI
      startRecordingBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
        Start Recording
      `
      startRecordingBtn.classList.add("primary")
      startRecordingBtn.style.background = ""
  
      // Stop visualizer animation
      stopVisualizer()
  
      // Clear recording interval
      clearInterval(recordingInterval)
  
      // If we have a transcript, add to history
      if (currentTranscript) {
        // Simulate translation to output language
        simulateTranslation()
      } else {
        sttResult.innerHTML = '<div class="stt-placeholder">Your transcription will appear here...</div>'
      }
    }
  
    // Simulate translation to the selected output language
    function simulateTranslation() {
      // In a real app, this would call a translation API
      // For demo purposes, we'll just show a loading state and then keep the same text
  
      const originalText = currentTranscript
      sttResult.innerHTML = '<div class="stt-placeholder">Translating...</div>'
  
      setTimeout(() => {
        // For demo, we'll just use the same text
        // In a real app, this would be the translated text
        sttResult.innerHTML = `<div>${originalText}</div>`
  
        // Add to history
        addToHistory(originalText)
  
        // Show success notification
        showNotification("Transcription and translation complete!", "success")
      }, 1500)
    }
  
    // Speak the transcribed text
    function speakText(text) {
      if (!text) return
  
      // Stop any ongoing speech
      synth.cancel()
  
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text)
  
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
  
      // Speak
      synth.speak(utterance)
  
      // Show notification
      showNotification("Playing audio...", "info")
    }
  
    // Download transcription as text file
    function downloadTranscription() {
      if (!currentTranscript) return
  
      const filename = `transcription_${new Date().toISOString().replace(/[:.]/g, "-")}.txt`
      const blob = new Blob([currentTranscript], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
  
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
  
      showNotification("Transcription downloaded!", "success")
    }
  
    // Copy transcription to clipboard
    function copyToClipboard() {
      if (!currentTranscript) return
  
      navigator.clipboard
        .writeText(currentTranscript)
        .then(() => {
          showNotification("Copied to clipboard!", "success")
        })
        .catch((error) => {
          console.error("Copy failed:", error)
          showNotification("Failed to copy to clipboard.", "error")
        })
    }
  
    // Visualizer animation
    function startVisualizer() {
      // Add recording-active class to visualizer
      document.querySelector(".stt-visualizer").classList.add("recording-active")
  
      // Animate bars
      visualizerBars.forEach((bar) => {
        // Set a random custom property for each bar
        bar.style.setProperty("--random-height", `${Math.floor(Math.random() * 95) + 5}px`)
      })
    }
  
    function stopVisualizer() {
      // Remove recording-active class
      document.querySelector(".stt-visualizer").classList.remove("recording-active")
  
      // Reset bars
      visualizerBars.forEach((bar) => {
        bar.style.height = "5px"
        bar.style.removeProperty("--random-height")
      })
    }
  
    // Update recording time
    function updateRecordingTime() {
      if (!recordingStartTime) return
  
      const elapsedTime = Math.floor((Date.now() - recordingStartTime) / 1000)
      const minutes = Math.floor(elapsedTime / 60)
      const seconds = elapsedTime % 60
  
      visualizerTime.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} / Recording...`
    }
  
    // Add to history
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
        speakText(text)
      })
  
      deleteBtn.addEventListener("click", () => {
        historyItem.remove()
      })
  
      // Add to history list
      historyList.prepend(historyItem)
  
      // Save to local storage (in a real app)
      saveToLocalStorage(text)
    }
  
    // Save to local storage
    function saveToLocalStorage(text) {
      // In a real app, you would save the transcription history to local storage
      // For this demo, we'll just log it
      console.log("Saved to history:", text)
    }
  
    // Notification system
    function showNotification(message, type = "info") {
      const notification = document.createElement("div")
      notification.className = "notification"
      notification.textContent = message
  
      // Add type-specific styling
      if (type === "error") {
        notification.style.background = "var(--error-color)"
      } else if (type === "success") {
        notification.style.background = "var(--success-color)"
      }
  
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
  
  