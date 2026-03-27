# Export Menu - CSV Export Feature

**Date:** March 27, 2026  
**Component:** `ExportMenu.tsx`

## Summary

Added a CSV export feature allowing users to download earnings data for analysis in Excel, Google Sheets, or other spreadsheet tools.

## Motivation

While the calendar has extensive visualization features, power users often need to analyze earnings data in external tools. Adding export functionality provides:

1. **Data portability** - Users own their data and can take it anywhere
2. **Spreadsheet analysis** - Advanced filtering, formulas, and charts
3. **Record keeping** - Save historical data for future reference
4. **Integration** - Use exported data in other workflows or tools

## Implementation

### Features

- **Export All**: Download all visible earnings to CSV
- **Export Pending**: Download only pending (unreported) earnings
- **Export Reported**: Download only reported earnings
- **Copy to Clipboard**: Copy as TSV for direct paste into spreadsheets

### Data Fields

The CSV export includes:
- Date
- Ticker
- Company name
- Time (Pre-Market / After-Hours)
- EPS Estimate
- EPS Actual
- Result (Beat/Miss/Pending)
- Surprise %
- Revenue Estimate ($B)
- Revenue Actual ($B)
- Beat Odds %

### UI/UX Details

- **Dropdown menu** with animated entrance/exit
- **Keyboard accessible**: Escape to close
- **Click outside to close**
- **Success toasts** confirming export
- **Smart filename**: Includes date range (e.g., `earnings-2026-03-24-to-2026-03-28.csv`)
- **Light/dark mode** support
- **Reduced motion** support

### Location in UI

Added to the header toolbar alongside other utility toggles (ColorBlindToggle, etc.)

## Technical Notes

- Uses native Blob API for file generation
- TSV format for clipboard (better paste compatibility)
- Escapes quotes in company names for CSV compliance
- Type-safe with proper null checking for `eps` field

## Preview

The export button appears in the header with a download icon. Clicking reveals a dropdown with export options and item counts.

## Future Enhancements

- JSON export format option
- Custom column selection
- Date range picker for historical export
- Scheduled email reports (with backend)
