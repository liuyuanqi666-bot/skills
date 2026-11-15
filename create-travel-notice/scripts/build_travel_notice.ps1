param(
    [string]$TemplatePath,

    [Parameter(Mandatory = $true)]
    [string]$DataJson,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'

function Get-RangeFormat {
    param($Range)
    $font = $Range.Font
    $paragraph = $Range.ParagraphFormat
    return @(
        $font.Name,
        $font.NameFarEast,
        $font.Size,
        $font.Bold,
        $font.Italic,
        $font.Underline,
        $font.Color,
        $paragraph.Alignment,
        $paragraph.LeftIndent,
        $paragraph.RightIndent,
        $paragraph.FirstLineIndent,
        $paragraph.SpaceBefore,
        $paragraph.SpaceAfter,
        $paragraph.LineSpacingRule,
        $paragraph.LineSpacing
    ) -join '|'
}

function Apply-RangeFormat {
    param($Range, [string]$Signature)
    $parts = $Signature.Split('|')
    $Range.Font.Name = $parts[0]
    $Range.Font.NameFarEast = $parts[1]
    $Range.Font.Size = [single]$parts[2]
    $Range.Font.Bold = [int]$parts[3]
    $Range.Font.Italic = [int]$parts[4]
    $Range.Font.Underline = [int]$parts[5]
    $Range.Font.Color = [int]$parts[6]
    $Range.ParagraphFormat.Alignment = [int]$parts[7]
    $Range.ParagraphFormat.LeftIndent = [single]$parts[8]
    $Range.ParagraphFormat.RightIndent = [single]$parts[9]
    $Range.ParagraphFormat.FirstLineIndent = [single]$parts[10]
    $Range.ParagraphFormat.SpaceBefore = [single]$parts[11]
    $Range.ParagraphFormat.SpaceAfter = [single]$parts[12]
    $Range.ParagraphFormat.LineSpacingRule = [int]$parts[13]
    $Range.ParagraphFormat.LineSpacing = [single]$parts[14]
}

function Get-ParagraphText {
    param($Paragraph)
    return ($Paragraph.Range.Text -replace "`r$", '')
}

function Find-Paragraph {
    param($Document, [string]$Pattern, [int]$MaxIndex = 0)
    $limit = if ($MaxIndex -gt 0) {
        [Math]::Min($MaxIndex, $Document.Paragraphs.Count)
    } else {
        $Document.Paragraphs.Count
    }
    for ($i = 1; $i -le $limit; $i++) {
        $paragraph = $Document.Paragraphs.Item($i)
        if ((Get-ParagraphText $paragraph) -match $Pattern) {
            return $paragraph
        }
    }
    throw "找不到模板段落：$Pattern"
}

function Replace-RegexMatch {
    param($Document, $Paragraph, [string]$Pattern, [string]$Replacement)
    $text = Get-ParagraphText $Paragraph
    $match = [regex]::Match($text, $Pattern)
    if (-not $match.Success) {
        throw "模板字段无法安全定位：$Pattern"
    }
    $range = $Paragraph.Range.Duplicate
    $find = $range.Find
    $find.ClearFormatting()
    $find.Text = $match.Value
    $find.Forward = $true
    $find.Wrap = 0
    $find.MatchCase = $true
    $find.MatchWildcards = $false
    if (-not $find.Execute()) {
        throw "模板字段匹配后无法重新定位：$Pattern"
    }
    $start = $range.Start
    $format = Get-RangeFormat $range
    $range.Text = $Replacement
    $newRange = $Document.Range($start, $start + $Replacement.Length)
    Apply-RangeFormat $newRange $format
}

function Get-MatchedRange {
    param($Document, $Paragraph, [string]$Pattern)
    $text = Get-ParagraphText $Paragraph
    $match = [regex]::Match($text, $Pattern)
    if (-not $match.Success) {
        throw "无法提取模板字段格式：$Pattern"
    }
    return $Document.Range(
        $Paragraph.Range.Start + $match.Index,
        $Paragraph.Range.Start + $match.Index + $match.Length
    )
}

function Get-CellText {
    param($Table, [int]$Row, [int]$Column)
    return ($Table.Cell($Row, $Column).Range.Text -replace "[`r`a]+$", '')
}

function Set-CellText {
    param($Document, $Cell, [string]$Text, [switch]$BoldBrackets)
    $range = $Cell.Range.Duplicate
    $range.End = $range.End - 1
    $range.Text = $Text
    if ($BoldBrackets) {
        foreach ($match in [regex]::Matches($Text, '【[^】]+】')) {
            $boldRange = $Document.Range(
                $Cell.Range.Start + $match.Index,
                $Cell.Range.Start + $match.Index + $match.Length
            )
            $boldRange.Font.Bold = -1
        }
    }
}

function Join-WordLines {
    param([object[]]$Lines)
    return [string]::Join([char]11, @($Lines | ForEach-Object { [string]$_ }))
}

function Normalize-Description {
    param([string]$Text)
    return ($Text -replace "`r`n", "`n" -replace "`r", "`n").Replace("`n", [char]11)
}

function Find-ItineraryTable {
    param($Document)
    for ($i = 1; $i -le $Document.Tables.Count; $i++) {
        $table = $Document.Tables.Item($i)
        try {
            $headers = 1..5 | ForEach-Object { Get-CellText $table 2 $_ }
            if ([string]::Join('|', $headers) -eq '日期|城市|交通|行程|餐') {
                return $table
            }
        } catch {
            continue
        }
    }
    throw '找不到包含“日期、城市、交通、行程、餐”的行程表。'
}

function Find-RowByFirstCell {
    param($Table, [string]$Pattern)
    for ($row = 1; $row -le $Table.Rows.Count; $row++) {
        try {
            if ((Get-CellText $Table $row 1) -match $Pattern) {
                return $row
            }
        } catch {
            continue
        }
    }
    throw "找不到表格行：$Pattern"
}

function Get-DayRows {
    param($Table)
    $result = @()
    for ($row = 1; $row -le $Table.Rows.Count; $row++) {
        try {
            if ((Get-CellText $Table $row 1) -match '^D\d+$') {
                $result += $row
            }
        } catch {
            continue
        }
    }
    return $result
}

function Find-HotelRowAfter {
    param($Table, [int]$DayRow, [int]$NextDayRow)
    for ($row = $DayRow + 1; $row -lt $NextDayRow; $row++) {
        try {
            if ((Get-CellText $Table $row 4) -match '^HOTEL：?\s*$') {
                return $row
            }
        } catch {
            continue
        }
    }
    return 0
}

function Get-LastAccessibleCellEnd {
    param($Table, [int]$Row)
    for ($column = 5; $column -ge 1; $column--) {
        try {
            return $Table.Cell($Row, $column).Range.End
        } catch {
            continue
        }
    }
    throw "无法定位表格第 $Row 行的结尾。"
}

function Get-InlineShapeInfo {
    param($Document)
    $result = @()
    for ($i = 1; $i -le $Document.InlineShapes.Count; $i++) {
        $shape = $Document.InlineShapes.Item($i)
        $result += "$($shape.Type)|$([math]::Round($shape.Width,2))|$([math]::Round($shape.Height,2))"
    }
    return $result
}

function Format-MeetingDateTime {
    param([string]$Value)
    $parsed = [datetime]::ParseExact(
        $Value,
        'yyyy-MM-dd HH:mm',
        [Globalization.CultureInfo]::InvariantCulture
    )
    $period = if ($parsed.Hour -lt 12) {
        '上午'
    } elseif ($parsed.Hour -lt 18) {
        '下午'
    } else {
        '晚上'
    }
    return "$($parsed.Month)月$($parsed.Day)日${period}$($parsed.ToString('HH:mm'))"
}

if ([string]::IsNullOrWhiteSpace($TemplatePath)) {
    $TemplatePath = [IO.Path]::GetFullPath(
        (Join-Path $PSScriptRoot '..\assets\travel-notice-blank-template.doc')
    )
    $templateSource = 'embedded'
} else {
    $TemplatePath = [IO.Path]::GetFullPath($TemplatePath)
    $templateSource = 'provided'
}
$DataJson = [IO.Path]::GetFullPath($DataJson)
$OutputPath = [IO.Path]::GetFullPath($OutputPath)

if (-not (Test-Path -LiteralPath $TemplatePath -PathType Leaf)) {
    throw "模板不存在：$TemplatePath"
}
if (-not (Test-Path -LiteralPath $DataJson -PathType Leaf)) {
    throw "数据文件不存在：$DataJson"
}
if ([IO.Path]::GetFullPath($TemplatePath) -eq [IO.Path]::GetFullPath($OutputPath)) {
    throw '输出路径不能与模板路径相同。'
}

$data = Get-Content -Raw -Encoding UTF8 -LiteralPath $DataJson | ConvertFrom-Json
if (-not $data.validation.ready) {
    throw "资料尚未确认完整，禁止制作。缺失：$($data.validation.missing -join '、')；待确认：$($data.validation.confirmation_required -join '、')；警告：$($data.validation.warnings -join '、')"
}

$templateHashBefore = (Get-FileHash -Algorithm SHA256 -LiteralPath $TemplatePath).Hash
$outputDirectory = Split-Path -Parent $OutputPath
if ($outputDirectory) {
    New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
}
[IO.File]::Copy($TemplatePath, $OutputPath, $true)

$word = $null
$sourceDoc = $null
$outputDoc = $null
$verifyDoc = $null

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0

    $sourceDoc = $word.Documents.Open($TemplatePath, $false, $true)
    $outputDoc = $word.Documents.Open($OutputPath, $false, $false)

    $sourceTable = Find-ItineraryTable $sourceDoc
    $sourcePostTable = $sourceDoc.Range($sourceTable.Range.End, $sourceDoc.Content.End).Text
    $sourceImageInfo = Get-InlineShapeInfo $sourceDoc
    $sourceSectionCount = $sourceDoc.Sections.Count

    $sourceIntro = Find-Paragraph $sourceDoc '^尊敬的游客' 30
    $sourceIntroText = Get-ParagraphText $sourceIntro
    $locationIndex = $sourceIntroText.IndexOf('自行抵达')
    if ($locationIndex -lt 0) {
        throw '模板首页缺少“自行抵达”机场位置定位词。'
    }
    $sourceLocationSuffix = $sourceIntroText.Substring($locationIndex)

    $sourceFrontFormatMap = [ordered]@{
        product = Get-RangeFormat (Get-MatchedRange $sourceDoc $sourceIntro '(?<=我部组织的 ).+?(?=，请您携带)')
        arrival = Get-RangeFormat (Get-MatchedRange $sourceDoc $sourceIntro '(?<=护照证件于).+?(?=自行抵达)')
        leader = Get-RangeFormat (Get-MatchedRange $sourceDoc (Find-Paragraph $sourceDoc '^领队信息' 30) '(?<=领队信息：)\s*.*$')
        outbound = Get-RangeFormat (Get-MatchedRange $sourceDoc (Find-Paragraph $sourceDoc '^出发航班' 30) '(?<=出发航班：).*?(?=[（(][^）)]*登机牌[^）)]*[）)]$)')
        return = Get-RangeFormat (Get-MatchedRange $sourceDoc (Find-Paragraph $sourceDoc '^回程航班' 30) '(?<=回程航班：).*?(?=[（(][^）)]*登机牌[^）)]*[）)]$)')
    }

    $preservePatterns = @('^托运行李', '^友情提示', '紧急联系人')
    $sourcePreservedFront = @()
    foreach ($pattern in $preservePatterns) {
        $sourcePreservedFront += Get-ParagraphText (Find-Paragraph $sourceDoc $pattern 30)
    }

    $sourceHeaders = 1..5 | ForEach-Object { Get-CellText $sourceTable 2 $_ }
    $sourceTableLayout = @(
        $sourceTable.Rows.Alignment,
        [math]::Round($sourceTable.Rows.LeftIndent, 2),
        $sourceTable.PreferredWidthType,
        $sourceTable.AllowAutoFit,
        [math]::Round($sourceTable.Spacing, 2),
        [math]::Round($sourceTable.TopPadding, 2),
        [math]::Round($sourceTable.LeftPadding, 2)
    ) -join '|'
    $sourceFeeRow = Find-RowByFirstCell $sourceTable '^团费包含'
    $sourceNoteRow = Find-RowByFirstCell $sourceTable '备\s*注'
    $sourceFeeCells = @(
        (Get-CellText $sourceTable $sourceFeeRow 1),
        (Get-CellText $sourceTable $sourceFeeRow 2)
    )
    $sourceNoteCells = @(
        (Get-CellText $sourceTable $sourceNoteRow 1),
        (Get-CellText $sourceTable $sourceNoteRow 2)
    )

    $intro = Find-Paragraph $outputDoc '^尊敬的游客' 30
    Replace-RegexMatch $outputDoc $intro '(?<=我部组织的 ).+?(?=，请您携带)' ([string]$data.product_name)
    Replace-RegexMatch $outputDoc $intro '(?<=护照证件于).+?(?=自行抵达)' (Format-MeetingDateTime $data.airport_arrival_datetime)

    $leader = Find-Paragraph $outputDoc '^领队信息' 30
    Replace-RegexMatch $outputDoc $leader '(?<=领队信息：)\s*.*$' " $($data.leader.name) $($data.leader.phone)"

    $outboundParagraph = Find-Paragraph $outputDoc '^出发航班' 30
    $outbound = $data.outbound_flight
    $outboundValue = "$($data.departure_date_cn) $($outbound.origin)→$($outbound.destination) $($outbound.number)（$($outbound.departure_time)–$($outbound.arrival_time)）"
    Replace-RegexMatch $outputDoc $outboundParagraph '(?<=出发航班：).*?(?=[（(][^）)]*登机牌[^）)]*[）)]$)' $outboundValue

    $returnParagraph = Find-Paragraph $outputDoc '^回程航班' 30
    $returnFlight = $data.return_flight
    $returnValue = "$($data.return_date_cn) $($returnFlight.origin)→$($returnFlight.destination) $($returnFlight.number)（$($returnFlight.departure_time)–$($returnFlight.arrival_time)）"
    Replace-RegexMatch $outputDoc $returnParagraph '(?<=回程航班：).*?(?=[（(][^）)]*登机牌[^）)]*[）)]$)' $returnValue

    $table = Find-ItineraryTable $outputDoc
    $titleCell = $table.Cell(1, 1)
    $titleText = Get-CellText $table 1 1
    $titleMatch = [regex]::Match($titleText, '(?:【团号】—【产品名称】|[A-Za-z]{2,}\d{6}[A-Za-z0-9-]*.*$)')
    if (-not $titleMatch.Success) {
        throw '无法安全定位行程表标题，未修改模板。'
    }
    $titleRange = $outputDoc.Range(
        $titleCell.Range.Start + $titleMatch.Index,
        $titleCell.Range.Start + $titleMatch.Index + $titleMatch.Length
    )
    $titleRange.Text = [string]$data.itinerary_title

    $dayRows = @(Get-DayRows $table)
    $sourceDays = @($data.days)
    if ($sourceDays.Count -gt $dayRows.Count) {
        throw "模板仅有 $($dayRows.Count) 个行程日槽位，资料包含 $($sourceDays.Count) 天。"
    }

    for ($i = 0; $i -lt $sourceDays.Count; $i++) {
        $row = $dayRows[$i]
        $day = $sourceDays[$i]
        Set-CellText $outputDoc $table.Cell($row, 1) "D$($day.day)"
        Set-CellText $outputDoc $table.Cell($row, 2) ([string]$day.city)
        Set-CellText $outputDoc $table.Cell($row, 3) (Join-WordLines @($day.transport_display))
        Set-CellText $outputDoc $table.Cell($row, 4) (Normalize-Description $day.description) -BoldBrackets
        Set-CellText $outputDoc $table.Cell($row, 5) (Join-WordLines @(
            "早餐:$($day.meals.breakfast)",
            "午餐:$($day.meals.lunch)",
            "晚餐:$($day.meals.dinner)"
        ))

        $nextDayRow = if ($i + 1 -lt $dayRows.Count) {
            $dayRows[$i + 1]
        } else {
            Find-RowByFirstCell $table '^团费包含'
        }
        $hotelRow = Find-HotelRowAfter $table $row $nextDayRow
        if ($hotelRow -gt 0) {
            Set-CellText $outputDoc $table.Cell($hotelRow, 4) 'HOTEL：'
        }
    }

    if ($sourceDays.Count -lt $dayRows.Count) {
        $firstUnusedRow = $dayRows[$sourceDays.Count]
        $feeRowBeforeDelete = Find-RowByFirstCell $table '^团费包含'
        $lastUnusedRow = $feeRowBeforeDelete - 1
        $deleteRange = $outputDoc.Range(
            $table.Cell($firstUnusedRow, 1).Range.Start,
            (Get-LastAccessibleCellEnd $table $lastUnusedRow)
        )
        $expectedRows = $lastUnusedRow - $firstUnusedRow + 1
        if ($deleteRange.Rows.Count -ne $expectedRows) {
            throw "多余行选择范围异常：期望 $expectedRows 行，实际 $($deleteRange.Rows.Count) 行。"
        }
        Write-Output "DELETE_ROWS=$firstUnusedRow-$lastUnusedRow RANGE_ROWS=$($deleteRange.Rows.Count)"
        try {
            $deleteRange.Rows.Delete()
        } catch {
            $deleteRange.Select()
            $word.Selection.Rows.Delete()
        }
    }

    $outputDoc.TrackRevisions = $false
    $outputDoc.Save()
    $outputDoc.Close(0)
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($outputDoc)
    $outputDoc = $null

    $verifyDoc = $word.Documents.Open($OutputPath, $false, $true)
    $verifyTable = Find-ItineraryTable $verifyDoc

    if ($verifyDoc.Sections.Count -ne $sourceSectionCount) {
        throw '分节数量发生变化。'
    }
    $finalImageInfo = Get-InlineShapeInfo $verifyDoc
    if ([string]::Join(';', $finalImageInfo) -cne [string]::Join(';', $sourceImageInfo)) {
        throw '图片数量、类型或尺寸发生变化。'
    }

    $finalPostTable = $verifyDoc.Range($verifyTable.Range.End, $verifyDoc.Content.End).Text
    if ($finalPostTable -cne $sourcePostTable) {
        throw '行程表后的内容发生变化。'
    }

    $finalIntroText = Get-ParagraphText (Find-Paragraph $verifyDoc '^尊敬的游客' 30)
    $finalLocationIndex = $finalIntroText.IndexOf('自行抵达')
    if ($finalLocationIndex -lt 0 -or $finalIntroText.Substring($finalLocationIndex) -cne $sourceLocationSuffix) {
        throw '机场抵达位置或其后文字发生变化。'
    }

    $finalPreservedFront = @()
    foreach ($pattern in $preservePatterns) {
        $finalPreservedFront += Get-ParagraphText (Find-Paragraph $verifyDoc $pattern 30)
    }
    if ([string]::Join("`n", $finalPreservedFront) -cne [string]::Join("`n", $sourcePreservedFront)) {
        throw '首页不可修改字段发生变化。'
    }

    $finalHeaders = 1..5 | ForEach-Object { Get-CellText $verifyTable 2 $_ }
    if ([string]::Join('|', $finalHeaders) -cne [string]::Join('|', $sourceHeaders)) {
        throw '行程表表头发生变化。'
    }
    $finalTableLayout = @(
        $verifyTable.Rows.Alignment,
        [math]::Round($verifyTable.Rows.LeftIndent, 2),
        $verifyTable.PreferredWidthType,
        $verifyTable.AllowAutoFit,
        [math]::Round($verifyTable.Spacing, 2),
        [math]::Round($verifyTable.TopPadding, 2),
        [math]::Round($verifyTable.LeftPadding, 2)
    ) -join '|'
    if ($finalTableLayout -cne $sourceTableLayout) {
        throw '行程表的整体定位或表级格式发生变化。'
    }

    $finalFeeRow = Find-RowByFirstCell $verifyTable '^团费包含'
    $finalNoteRow = Find-RowByFirstCell $verifyTable '备\s*注'
    $finalFeeCells = @(
        (Get-CellText $verifyTable $finalFeeRow 1),
        (Get-CellText $verifyTable $finalFeeRow 2)
    )
    $finalNoteCells = @(
        (Get-CellText $verifyTable $finalNoteRow 1),
        (Get-CellText $verifyTable $finalNoteRow 2)
    )
    if ([string]::Join("`n", $finalFeeCells) -cne [string]::Join("`n", $sourceFeeCells)) {
        throw '“团费包含”内容发生变化。'
    }
    if ([string]::Join("`n", $finalNoteCells) -cne [string]::Join("`n", $sourceNoteCells)) {
        throw '“备注”内容发生变化。'
    }

    $expectedMeeting = Format-MeetingDateTime $data.airport_arrival_datetime
    if (-not $finalIntroText.Contains([string]$data.product_name)) {
        throw '产品名称与已确认资料不一致。'
    }
    if (-not $finalIntroText.Contains($expectedMeeting)) {
        throw '机场抵达日期时间与已确认资料不一致。'
    }

    $finalLeaderText = Get-ParagraphText (Find-Paragraph $verifyDoc '^领队信息' 30)
    $expectedLeaderText = "领队信息： $($data.leader.name) $($data.leader.phone)"
    if ($finalLeaderText -cne $expectedLeaderText) {
        throw '领队信息与已确认资料不一致。'
    }

    $finalOutboundText = Get-ParagraphText (Find-Paragraph $verifyDoc '^出发航班' 30)
    if (-not $finalOutboundText.Contains($outboundValue)) {
        throw '出发航班与已确认资料不一致。'
    }
    $finalReturnText = Get-ParagraphText (Find-Paragraph $verifyDoc '^回程航班' 30)
    if (-not $finalReturnText.Contains($returnValue)) {
        throw '回程航班与已确认资料不一致。'
    }

    $finalTitleText = Get-CellText $verifyTable 1 1
    if (-not $finalTitleText.Contains([string]$data.itinerary_title)) {
        throw '行程表标题与已确认资料不一致。'
    }

    $finalFrontFormatMap = [ordered]@{
        product = Get-RangeFormat (Get-MatchedRange $verifyDoc (Find-Paragraph $verifyDoc '^尊敬的游客' 30) ([regex]::Escape([string]$data.product_name)))
        arrival = Get-RangeFormat (Get-MatchedRange $verifyDoc (Find-Paragraph $verifyDoc '^尊敬的游客' 30) ([regex]::Escape($expectedMeeting)))
        leader = Get-RangeFormat (Get-MatchedRange $verifyDoc (Find-Paragraph $verifyDoc '^领队信息' 30) '(?<=领队信息：)\s*.*$')
        outbound = Get-RangeFormat (Get-MatchedRange $verifyDoc (Find-Paragraph $verifyDoc '^出发航班' 30) ([regex]::Escape($outboundValue)))
        return = Get-RangeFormat (Get-MatchedRange $verifyDoc (Find-Paragraph $verifyDoc '^回程航班' 30) ([regex]::Escape($returnValue)))
    }
    foreach ($key in $sourceFrontFormatMap.Keys) {
        if ($sourceFrontFormatMap[$key] -cne $finalFrontFormatMap[$key]) {
            throw "首页可修改字段格式发生变化：$key"
        }
    }

    $finalDayRows = @(Get-DayRows $verifyTable)
    for ($i = 0; $i -lt $sourceDays.Count; $i++) {
        $row = $finalDayRows[$i]
        $day = $sourceDays[$i]

        if ((Get-CellText $verifyTable $row 1) -cne "D$($day.day)") {
            throw "第$($i + 1)天日期栏与已确认资料不一致。"
        }
        if ((Get-CellText $verifyTable $row 2) -cne [string]$day.city) {
            throw "第$($i + 1)天城市与已确认资料不一致。"
        }

        $actualTransport = (Get-CellText $verifyTable $row 3).Replace("`r", [char]11)
        $expectedTransport = Join-WordLines @($day.transport_display)
        if ($actualTransport -cne $expectedTransport) {
            throw "第$($i + 1)天交通与已确认资料不一致。"
        }

        $actualDescription = (Get-CellText $verifyTable $row 4).Replace("`r", [char]11)
        $expectedDescription = Normalize-Description ([string]$day.description)
        if ($actualDescription -cne $expectedDescription) {
            throw "第$($i + 1)天行程描述未能逐字匹配源文本。"
        }

        $actualMeals = (Get-CellText $verifyTable $row 5).Replace("`r", [char]11)
        $expectedMeals = Join-WordLines @(
            "早餐:$($day.meals.breakfast)",
            "午餐:$($day.meals.lunch)",
            "晚餐:$($day.meals.dinner)"
        )
        if ($actualMeals -cne $expectedMeals) {
            throw "第$($i + 1)天餐食与已确认资料不一致。"
        }

        $nextDayRow = if ($i + 1 -lt $finalDayRows.Count) {
            $finalDayRows[$i + 1]
        } else {
            $finalFeeRow
        }
        $finalHotelRow = Find-HotelRowAfter $verifyTable $row $nextDayRow
        if ($finalHotelRow -gt 0 -and (Get-CellText $verifyTable $finalHotelRow 4) -cne 'HOTEL：') {
            throw "第$($i + 1)天 HOTEL 字段未保持空白。"
        }
    }

    Write-Output "OUTPUT=$OutputPath"
    Write-Output "TEMPLATE_SOURCE=$templateSource"
    Write-Output "PAGES=$($verifyDoc.ComputeStatistics(2))"
    Write-Output "DAYS=$($sourceDays.Count)"
    Write-Output "SECTIONS=$($verifyDoc.Sections.Count)"
    Write-Output "INLINE_SHAPES=$($verifyDoc.InlineShapes.Count)"
    Write-Output 'MODIFIED_FIELDS_QA=PASS'
    Write-Output 'STRUCTURAL_QA=PASS'
}
finally {
    if ($verifyDoc -ne $null) {
        $verifyDoc.Close(0)
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($verifyDoc)
    }
    if ($outputDoc -ne $null) {
        $outputDoc.Close(0)
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($outputDoc)
    }
    if ($sourceDoc -ne $null) {
        $sourceDoc.Close(0)
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($sourceDoc)
    }
    if ($word -ne $null) {
        $word.Quit()
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)
    }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

$templateHashAfter = (Get-FileHash -Algorithm SHA256 -LiteralPath $TemplatePath).Hash
if ($templateHashBefore -cne $templateHashAfter) {
    throw '原模板文件哈希发生变化。'
}
Write-Output "TEMPLATE_SHA256=$templateHashAfter"
