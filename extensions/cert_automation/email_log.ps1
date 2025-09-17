# email_log.ps1
param (
  [string]$SmtpServer = "smtp.web4app.com",
  [string]$From = "cert-bot@web4app.com",
  [string]$To = "admin@web4app.com",
  [string]$Username = "web4app",
  [string]$Password = "your_smtp_password"
)

$LogDir = "$PSScriptRoot\logs"
$LatestLog = Get-ChildItem -Path $LogDir -Filter *.log | Sort-Object LastWriteTime -Descending | Select-Object -First 1

Send-MailMessage -From $From -To $To -Subject "🔐 WDP Cert Automation Log - $($LatestLog.Name)" `
  -Body "Attached: latest cert automation log." -Attachments $LatestLog.FullName `
  -SmtpServer $SmtpServer -Credential (New-Object PSCredential($Username, (ConvertTo-SecureString $Password -AsPlainText -Force))) -UseSsl
