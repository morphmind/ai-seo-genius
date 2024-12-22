export interface LinkReport {
    article: string;
    totalLinks: number;
    successfulLinks: number;
    failedLinks: number;
    links: AddedLink[];
    errors: string[];
    timestamp: Date;
}

export interface AddedLink {
    url: string;
    anchorText: string;
    position: string;
    similarityScore: number;
    paragraph: string;
}

export class LinkReportGenerator {
    private reports: LinkReport[] = [];

    addReport(report: LinkReport) {
        this.reports.push(report);
    }

    generateHTML(): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Link Ekleme Raporu</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .stats { background: #f5f5f5; padding: 20px; border-radius: 5px; }
                    .link-added { background: #e6ffe6; padding: 10px; margin: 10px 0; border-left: 4px solid green; }
                    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>Link Ekleme Raporu</h1>
                ${this.reports.map(report => this.generateReportSection(report)).join('')}
            </body>
            </html>
        `;
    }

    private generateReportSection(report: LinkReport): string {
        return `
            <div class="report-section">
                <h2>${report.article}</h2>
                <div class="stats">
                    <p>Toplam Link: ${report.totalLinks}</p>
                    <p>Başarılı: ${report.successfulLinks}</p>
                    <p>Başarısız: ${report.failedLinks}</p>
                    <p>Tarih: ${report.timestamp.toLocaleString()}</p>
                </div>
                
                ${report.links.length > 0 ? `
                    <h3>Eklenen Linkler</h3>
                    <table>
                        <tr>
                            <th>URL</th>
                            <th>Anchor Text</th>
                            <th>Pozisyon</th>
                            <th>Benzerlik</th>
                        </tr>
                        ${report.links.map(link => `
                            <tr>
                                <td>${link.url}</td>
                                <td>${link.anchorText}</td>
                                <td>${link.position}</td>
                                <td>${(link.similarityScore * 100).toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </table>
                ` : ''}
                
                ${report.errors.length > 0 ? `
                    <h3>Hatalar</h3>
                    <ul>
                        ${report.errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
    }

    generateCSV(): string {
        const headers = ['Article', 'Total Links', 'Successful', 'Failed', 'Timestamp'];
        const rows = this.reports.map(report => [
            report.article,
            report.totalLinks,
            report.successfulLinks,
            report.failedLinks,
            report.timestamp.toISOString()
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }

    generateJSON(): string {
        return JSON.stringify({
            reportDate: new Date(),
            totalReports: this.reports.length,
            reports: this.reports
        }, null, 2);
    }

    downloadReport(format: 'html' | 'csv' | 'json') {
        let content: string;
        let mimeType: string;
        let extension: string;

        switch (format) {
            case 'html':
                content = this.generateHTML();
                mimeType = 'text/html';
                extension = 'html';
                break;
            case 'csv':
                content = this.generateCSV();
                mimeType = 'text/csv';
                extension = 'csv';
                break;
            case 'json':
                content = this.generateJSON();
                mimeType = 'application/json';
                extension = 'json';
                break;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `link_report_${new Date().toISOString().split('T')[0]}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
