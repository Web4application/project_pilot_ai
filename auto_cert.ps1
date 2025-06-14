# -------------------------------
# ProjectPilotAI: auto_cert.ps1
# -------------------------------

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$OutPath = "$ScriptDir\..\..\certs\"
$LogPath = "$ScriptDir\cert_log_$((Get-Date).ToString('yyyyMMdd_HHmmss')).log"

if (!(Test-Path $OutPath)) { New-Item -ItemType Directory -Path $OutPath | Out-Null }

# Import the module
. "$ScriptDir\CertProvisioning.psm1"

# Create log function
function Log {
    param($msg)
    $time = Get-Date -Format "HH:mm:ss"
    "$time - $msg" | Tee-Object -FilePath $LogPath -Append
}

Log "🔐 Starting WDP cert automation..."

try {
    $root = New-WdpRootCA -CN "WdpTestCA" -OutPath $OutPath
    Log "✅ Root CA created: $($root.Subject)"

    $targets = @("localhost", "127.0.0.1", $env:COMPUTERNAME)

    foreach ($dns in $targets) {
        Log "🔧 Creating device cert for '$dns'"
        $pfx = New-WdpDeviceCert -DnsName $dns -OutPath $OutPath -Password "Wdp@1234" -RootCAPath "$OutPath\WdpTestCA.cer"
        Log "✅ PFX created: $pfx"

        Log "🔄 Rebinding WDP to cert for '$dns'"
        Set-WdpCert -PfxPath $pfx -Password "Wdp@1234"
        Log "✅ WDP rebind complete for '$dns'"
    }

    Log "🎉 All certs issued and bound successfully."

} catch {
    Log "❌ ERROR: $_"
    exit 1
}

Log "📁 Log saved to: $LogPath"
# Log structured event
$eventLogPath = "$ScriptDir\cert_events.json"

$logData = @{
    timestamp = (Get-Date).ToString("o")
    issued_dns = $targets
    root_ca = $root.Subject
    cert_files = Get-ChildItem -Path $OutPath -Filter *.pfx | Select-Object -ExpandProperty Name
    status = "success"
}

if (Test-Path $eventLogPath) {
    $existing = Get-Content $eventLogPath | ConvertFrom-Json
    $all = $existing + $logData
} else {
    $all = @($logData)
}

$all | ConvertTo-Json -Depth 5 | Set-Content $eventLogPath -Encoding UTF8

