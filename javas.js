function scanWebsite() {
    const url = document.getElementById('websiteInput').value;
    const report = document.getElementById('report');
    const reportContent = document.getElementById('reportContent');
    const spinner = document.getElementById('loadingSpinner');

    report.style.display = 'block';
    if (spinner) spinner.style.display = 'block';
    reportContent.innerText = 'Performing scan for ' + url + '...';
    
    fetch('http://127.0.0.1:8080/scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
    })
    .then(response => response.json())
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
    })
    .catch(error => {
        if (spinner) spinner.style.display = 'none';
        reportContent.innerHTML = '<span class="error-message">An error occurred during the scan. Please check the domain and try again.</span>';
        console.error('Scan error:', error);
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