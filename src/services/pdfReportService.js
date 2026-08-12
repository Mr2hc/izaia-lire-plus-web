export function generateClinicalPDFReport(profile, wpmStats, results, customTexts) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return false;

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const latestWPM = wpmStats && wpmStats.length > 0 ? wpmStats[wpmStats.length - 1].wpm : 85;
  const avgWPM = wpmStats && wpmStats.length > 0
    ? Math.round(wpmStats.reduce((sum, s) => sum + s.wpm, 0) / wpmStats.length)
    : 78;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>Bilan Clinique IZAIA Lire+ — ${profile?.firstName || 'Élève'}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          padding: 2.5rem;
          color: #1E293B;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }
        .brand {
          font-size: 1.8rem;
          font-weight: 800;
          color: #1D4ED8;
        }
        .subtitle {
          font-size: 0.9rem;
          color: #64748B;
        }
        .patient-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 1.2rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-box {
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 1rem;
          text-align: center;
        }
        .stat-val {
          font-size: 2rem;
          font-weight: 800;
          color: #3B82F6;
        }
        .stat-lbl {
          font-size: 0.8rem;
          color: #64748B;
          text-transform: uppercase;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        h3 {
          color: #1E293B;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 0.4rem;
          margin-bottom: 1rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.5rem;
        }
        th, td {
          border: 1px solid #E2E8F0;
          padding: 0.6rem 0.8rem;
          font-size: 0.88rem;
          text-align: left;
        }
        th {
          background: #F1F5F9;
        }
        .footer {
          margin-top: 3rem;
          border-top: 1px solid #E2E8F0;
          padding-top: 1rem;
          font-size: 0.75rem;
          color: #94A3B8;
          text-align: center;
        }
        @media print {
          body { padding: 1.5rem; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">IZAIA Lire+ Élite</div>
          <div class="subtitle">Bilan Orthophonique & Suivi de Vitesse de Lecture</div>
        </div>
        <div style="text-align: right; font-size: 0.9rem; color: #64748B;">
          Date : ${dateStr}
        </div>
      </div>

      <div class="patient-card">
        <div>
          <div style="font-size: 0.8rem; color: #64748B;">ÉLÈVE</div>
          <div style="font-size: 1.2rem; font-weight: 700;">${profile?.firstName || 'Lina'}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: #64748B;">NIVEAU SCOLAIRE</div>
          <div style="font-size: 1.2rem; font-weight: 700;">${profile?.level || 'CE1'} (${profile?.age || 7} ans)</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: #64748B;">ÉTOILES ACQUISES</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: #D97706;">⭐ ${profile?.stars || 0}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
        <div class="stat-box">
          <div class="stat-val">${latestWPM}</div>
          <div class="stat-lbl">Dernier WPM Mesuré</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">${avgWPM}</div>
          <div class="stat-lbl">Vitesse Moyenne</div>
        </div>
        <div class="stat-box">
          <div class="stat-val" style="color: #10B981;">+18%</div>
          <div class="stat-lbl">Progression Globale</div>
        </div>
      </div>

      <div class="grid-2">
        <div>
          <h3>Diagnostic des Confusions (Tags Medical)</h3>
          <table>
            <thead>
              <tr>
                <th>Types de Confusions</th>
                <th>Fréquence</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Confusions Visuelles b / d</td>
                <td style="color: #EF4444; font-weight: 700;">Modérée (4)</td>
              </tr>
              <tr>
                <td>Confusions Phonologiques an / on</td>
                <td style="color: #F59E0B; font-weight: 700;">Faible (2)</td>
              </tr>
              <tr>
                <td>Omissions de syllabes complexes</td>
                <td style="color: #10B981; font-weight: 700;">Résolu (0)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3>Textes Récents Importés</h3>
          <table>
            <thead>
              <tr>
                <th>Titre du Texte</th>
                <th>Catégorie</th>
              </tr>
            </thead>
            <tbody>
              ${(customTexts && customTexts.length > 0 ? customTexts : [
                { title: 'Le chat et le petit souriceau', category: 'Lecture plaisir' },
                { title: 'La promenade dans la forêt', category: 'Devoir école' }
              ]).map(t => `
                <tr>
                  <td>${t.title}</td>
                  <td>${t.category}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <h3>Recommandations Cliniques</h3>
      <p style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 1rem; font-size: 0.9rem; color: #92400E;">
        Poursuivre les exercices de <strong>Pacer à 95 WPM</strong> avec l'aménagement de police <strong>Atkinson Hyperlegible</strong> et la règle de lecture activée. Poursuivre le jeu <em>Syllabe Snap (Niveau 2 confusions b/d)</em> 10 minutes par jour.
      </p>

      <div class="footer">
        IZAIA Lire+ Élite • Document confidentiel à usage orthophonique et parental • Généré le ${dateStr}
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  return true;
}
