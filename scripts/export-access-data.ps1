$dbPath = "c:\Users\tlsmith\.gemini\antigravity\playground\static-cluster\data\Training Tracker - CLICK THIS ONE.accdb"
$outputDir = "c:\Users\tlsmith\.gemini\antigravity\playground\static-cluster\data\utils"

if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir
}

$cn = New-Object -ComObject ADODB.Connection
$cn.Open("Provider=Microsoft.ACE.OLEDB.12.0;Data Source=$dbPath;Persist Security Info=False;")

$tables = @("Employee", "Training", "Attendance", "Certificate", "CertificateTrainingExclusion", "Expiration")

foreach ($table in $tables) {
    Write-Host "Exporting $table..."
    $rs = $cn.Execute("SELECT * FROM [$table]")
    $data = @()
    
    if (-not $rs.EOF) {
        $rs.MoveFirst()
        while (-not $rs.EOF) {
            $row = @{}
            for ($i = 0; $i -lt $rs.Fields.Count; $i++) {
                $fieldName = $rs.Fields.Item($i).Name
                $value = $rs.Fields.Item($i).Value
                # Handle DBNull
                if ($value -eq $null) {
                     $value = $null 
                }
                $row[$fieldName] = $value
            }
            $data += $row
            $rs.MoveNext()
        }
    }
    
    $json = $data | ConvertTo-Json -Depth 5 -Compress
    $json | Out-File -FilePath "$outputDir\$table.json" -Encoding utf8
}

$cn.Close()
Write-Host "Export complete."
