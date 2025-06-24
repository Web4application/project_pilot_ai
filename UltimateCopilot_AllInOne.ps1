# UltimateCopilot_AllInOne.ps1
# PowerShell AI Copilot: chat, voice I/O, file, web search, run code, logging, Whisper

# --- CONFIGURATION ---
$apiKey = $env:OPENAI_API_KEY
if (-not $apiKey) {
    Write-Host "❗ Set OPENAI_API_KEY environment variable before running." -ForegroundColor Red
    exit
}
$logFile = "$PSScriptRoot\CopilotLog.txt"

# --- VOICE OUTPUT SETUP ---
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
function Speak($text) {
    $synth.Speak($text)
}

# --- GLOBAL CHAT MEMORY ---
$global:history = @(
    @{ role = "system"; content = "You are a helpful AI Copilot assistant in PowerShell with voice, file, web, and code execution capabilities." }
)

# --- FILE INPUT ---
function Load-FileToAI {
    param ([string]$filePath)
    if (-not (Test-Path $filePath)) {
        Write-Host "❌ File not found: $filePath"
        return
    }
    $content = Get-Content $filePath -Raw
    Write-Host "✅ File loaded and sent to Copilot."
    $global:history += @{ role = "user"; content = "Please analyze this file content:`n$content" }
}

# --- SAFE AI-COMMAND EXECUTION ---
function Run-AICommand {
    param ([string]$command)
    Write-Host "`n💡 AI suggested code:" -ForegroundColor Cyan
    Write-Host $command -ForegroundColor Yellow
    $confirm = Read-Host "Run this code? (y/n)"
    if ($confirm -eq "y") {
        try {
            Invoke-Expression $command
        } catch {
            Write-Host "❌ Error running code: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "🔒 Code not run."
    }
}

# --- WEB SEARCH (DuckDuckGo) ---
function WebSearch {
    param ([string]$query)
    $encoded = [System.Web.HttpUtility]::UrlEncode($query)
    $url = "https://html.duckduckgo.com/html/?q=$encoded"
    try {
        $result = Invoke-WebRequest $url -UseBasicParsing
        $snippet = $result.Content -replace '<[^>]+>', '' -replace '\s+', ' '
        return $snippet.Substring(0, [Math]::Min(1000, $snippet.Length))
    } catch {
        return "Could not perform web search."
    }
}

# --- VOICE INPUT via Whisper API ---
function Record-VoiceAndTranscribe {
    $file = "$env:TEMP\speech.wav"
    Write-Host "🎙️ Recording 5 seconds... Please speak now."
    
    # Change device name to match your mic - run `ffmpeg -list_devices true -f dshow -i dummy` to find
    $micName = "Microphone (Realtek(R) Audio)"  
    # If your mic name is different, update $micName above
    
    $ffmpeg = "ffmpeg" # Assumes ffmpeg is in your PATH
    
    # Record audio with ffmpeg
    & $ffmpeg -f dshow -i audio="$micName" -t 5 -acodec pcm_s16le -ar 16000 -ac 1 "$file" -y > $null 2>&1
    
    if (-not (Test-Path $file)) {
        Write-Host "❌ Could not record voice input."
        return ""
    }
    
    $headers = @{
        "Authorization" = "Bearer $apiKey"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.openai.com/v1/audio/transcriptions" `
            -Method Post `
            -Headers $headers `
            -Form @{
                file = Get-Item $file
                model = "whisper-1"
            }
        Write-Host "🗣️ You said: $($response.text)"
        return $response.text
    } catch {
        Write-Host "❌ Whisper API call failed: $_"
        return ""
    }
}

# --- LOGGING ---
function Log-Chat {
    param (
        [string]$userText,
        [string]$aiText
    )
    Add-Content -Path $logFile -Value "`n[User] ($(Get-Date -Format u)): $userText"
    Add-Content -Path $logFile -Value "`n[AI] ($(Get-Date -Format u)): $aiText"
}

# --- MAIN LOOP ---
while ($true) {
    $userInput = Read-Host "`n🧑 You (commands: exit, file <path>, run <code>, search <query>, voice)"

    switch -Regex ($userInput) {
        '^exit$' {
            Write-Host "👋 Goodbye!"
            break
        }
        '^file\s+(.*)$' {
            $path = $matches[1].Trim()
            Load-FileToAI $path
            continue
        }
        '^run\s+(.*)$' {
            $cmd = $matches[1].Trim()
            Run-AICommand $cmd
            continue
        }
        '^search\s+(.*)$' {
            $query = $matches[1].Trim()
            $results = WebSearch $query
            Write-Host "`n🌐 Web search snippet:`n$results"
            $global:history += @{ role = "user"; content = "I searched the web for '$query' and found this info:`n$results" }
            continue
        }
        '^voice$' {
            $voiceText = Record-VoiceAndTranscribe
            if ($voiceText) {
                $userInput = $voiceText
            } else {
                continue
            }
        }
        default {
            # Proceed with regular chat
        }
    }

    # Add user input to history
    $global:history += @{ role = "user"; content = $userInput }

    # Prepare request body
    $body = @{
        model = "gpt-4"
        messages = $global:history
    } | ConvertTo-Json -Depth 20 -Compress

    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type"  = "application/json"
    }

    try {
        $response = Invoke-RestMethod -Uri "https://api.openai.com/v1/chat/completions" `
            -Method Post -Headers $headers -Body $body

        $reply = $response.choices[0].message.content.Trim()
        $global:history += @{ role = "assistant"; content = $reply }

        Write-Host "`n🤖 Copilot says:`n$reply" -ForegroundColor Green
        Speak $reply
        Log-Chat -userText $userInput -aiText $reply
    } catch {
        Write-Host "❌ OpenAI API error: $_" -ForegroundColor Red
    }
}
