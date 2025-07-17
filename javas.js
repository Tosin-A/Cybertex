function scanWebsite() {
    const downloadBtn = document.getElementById('downloadPDF');
    console.log('Scan started: hiding and disabling download button');
    downloadBtn.style.display = 'inline-block';  // forced visible for debug
    downloadBtn.disabled = false;                 // forced enabled for debug
    console.log('Download button forced visible and enabled on scan start');

    let url = document.getElementById('websiteInput').value.trim();
    url = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!url || !url.includes('.')) {
        alert('Please enter a valid domain like example.com');
        return;
    }
    const report = document.getElementById('report');
    const reportContent = document.getElementById('reportContent');
    const spinner = document.getElementById('loadingSpinner');

    report.style.display = 'block';
    if (spinner) spinner.style.display = 'block';
    reportContent.innerText = 'Performing scan for ' + url + '...';
    
    fetch('https://backend-sa9j.onrender.com/scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
    })
    .then(response => response.x())
    .then(data => {
        reportContent.innerHTML = `
            <strong>Scan Complete for ${data.domain}</strong><br/>
            SSL Grade: ${data.sslGrade} — <em>This tells how secure your website connection is.</em><br/>
            <a href="https://securityheaders.com/?q=${data.domain}" target="_blank" class="report-link-btn">View Header Security Report</a> — <em>See if your website is missing basic protection settings.</em><br/><br/>
            DNS Check: ${data.dnsCheck === 'yes' ? 'Valid' : 'Check your domain setup'}<br/>
            Security Headers:<br/>
            - Content-Security-Policy: ${data.securityHeaders["Content-Security-Policy"]}<br/>
            - X-Frame-Options: ${data.securityHeaders["X-Frame-Options"]}<br/>
            - X-Content-Type-Options: ${data.securityHeaders["X-Content-Type-Options"]}
            <br/><br/>
            <div class="next-steps">
                <h3>Next Steps</h3>
                <p>Improve your security posture with a full site audit and personalised fix suggestions.</p>
                <a href="Pricing.html" class="next-step-btn">Upgrade to Full Protection</a>
            </div>
        `;
        if (spinner) spinner.style.display = 'none';
        reportContent.classList.add('success-animate');
        setTimeout(() => {
          reportContent.classList.remove('success-animate');
        }, 2000);
        console.log('Scan successful: showing and enabling download button');
        downloadBtn.style.display = 'inline-block';
        downloadBtn.disabled = false;
    })
    .catch(async error => {
        if (spinner) spinner.style.display = 'none';
        const errorText = error?.message || 'Scan failed. Try again later.';
        reportContent.innerHTML = `<span class="error-message">Error during scan: ${errorText}</span>`;
        console.error('Scan error:', error);
        console.log('Scan failed: hiding and disabling download button');
        downloadBtn.style.display = 'none';
        downloadBtn.disabled = true;
    });
}

// Animated background (simple matrix style)
const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const letters = '0101010101010101';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function draw() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f0';
  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

setInterval(draw, 33);

document.querySelector('.menu-toggle').addEventListener('click', function() {
  document.querySelector('nav ul').classList.toggle('show');
});

function downloadReport() {
  const content = document.getElementById('reportContent').innerText;
  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'scan-report.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
