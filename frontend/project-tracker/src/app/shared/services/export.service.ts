import { Injectable } from '@angular/core';
import { Project } from '../models/project.model';

/// <summary>
/// Service for exporting project data to CSV and Excel formats
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  /// <summary>
  /// Export projects to CSV format
  /// CSV is widely compatible and suitable for data analysis
  /// </summary>
  exportToCSV(projects: Project[], filename: string = 'projects.csv'): void {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Start Date', 'Due Date', 'Created At'];
    const csvData = projects.map(p => [
      p.id,
      this.escapeCsvValue(p.title),
      this.escapeCsvValue(p.description || ''),
      p.status,
      p.priority,
      this.formatDate(p.startDate),
      this.formatDate(p.dueDate),
      this.formatDate(p.createdAt)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /// <summary>
  /// Export projects to Excel format
  /// Uses HTML table approach - suitable for basic Excel files
  /// For production with complex formatting, consider using 'xlsx' or 'exceljs' libraries
  /// </summary>
  exportToExcel(projects: Project[], filename: string = 'projects.xlsx'): void {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Start Date', 'Due Date', 'Created At'];
    
    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #999; padding: 8px; text-align: left; }
            th { background-color: #0d6efd; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join('')}</tr>
            </thead>
            <tbody>
    `;

    projects.forEach(p => {
      excelContent += `
        <tr>
          <td>${p.id}</td>
          <td>${this.escapeHtml(p.title)}</td>
          <td>${this.escapeHtml(p.description || '')}</td>
          <td>${p.status}</td>
          <td>${p.priority}</td>
          <td>${this.formatDate(p.startDate)}</td>
          <td>${this.formatDate(p.dueDate)}</td>
          <td>${this.formatDate(p.createdAt)}</td>
        </tr>
      `;
    });

    excelContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    this.downloadFile(excelContent, filename, 'application/vnd.ms-excel');
  }

  /// <summary>
  /// Escape CSV special characters (comma, quote, newline)
  /// </summary>
  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /// <summary>
  /// Escape HTML special characters
  /// </summary>
  private escapeHtml(value: string): string {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  /// <summary>
  /// Format date to locale string (MM/DD/YYYY)
  /// </summary>
  private formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
  }

  /// <summary>
  /// Download file to user's computer using blob and link
  /// </summary>
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}
