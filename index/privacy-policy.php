<?php
$year = date('Y');
$effective_date = '1 June 2026';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy | UbuntuTrade</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        body { background: #f5f5f5; color: #333; }
        .pp-header {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            padding: 48px 20px 36px;
            text-align: center;
        }
        .pp-header h1 { font-size: 2rem; margin-bottom: 8px; }
        .pp-header h1 span { color: #e07b39; }
        .pp-header p { opacity: 0.75; font-size: 0.95rem; }
        .pp-container {
            max-width: 820px;
            margin: 40px auto;
            padding: 0 20px 60px;
        }
        .pp-card {
            background: white;
            border-radius: 12px;
            padding: 32px 36px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.07);
            margin-bottom: 24px;
        }
        .pp-card h2 {
            font-size: 1.1rem;
            color: #1a1a2e;
            border-bottom: 2px solid #e07b39;
            padding-bottom: 8px;
            margin-bottom: 16px;
        }
        .pp-card p, .pp-card li {
            font-size: 0.95rem;
            line-height: 1.75;
            color: #555;
        }
        .pp-card ul { padding-left: 20px; margin-top: 8px; }
        .pp-card li { margin-bottom: 6px; }
        .effective-date {
            text-align: center;
            font-size: 0.82rem;
            color: #aaa;
            margin-bottom: 28px;
        }
        .pp-footer { text-align: center; padding: 24px; color: #aaa; font-size: 13px; }
        .pp-footer a { color: #e07b39; text-decoration: none; }
    </style>
</head>
<body>

<nav class="navbar">
    <div class="logo">Ubuntu <span class="color-logo">Trade</span></div>
    <a href="/index/index.html" style="color:white;text-decoration:none;font-size:1rem;">&larr; Back to Home</a>
</nav>

<div class="pp-header">
    <h1>Ubuntu<span>Trade</span> Privacy Policy</h1>
    <p>We are committed to protecting your personal information.</p>
</div>

<div class="pp-container">
    <p class="effective-date">
        Effective date: <?php echo htmlspecialchars($effective_date); ?> &mdash;
        Last updated: <?php echo htmlspecialchars($effective_date); ?>
    </p>

    <div class="pp-card">
        <h2>1. Who We Are</h2>
        <p>UbuntuTrade ("we", "our", "us") is a community-based buy-and-sell platform that connects local buyers and sellers. By using this platform, you agree to the collection and use of information as described in this policy.</p>
    </div>

    <div class="pp-card">
        <h2>2. Information We Collect</h2>
        <p>We collect the following personal information when you register or use our platform:</p>
        <ul>
            <li><strong>Account information:</strong> full name, email address, and password (stored as a secure hash).</li>
            <li><strong>Profile data:</strong> username and location (optional).</li>
            <li><strong>Transaction data:</strong> products listed, orders placed, cart contents, and payment records.</li>
            <li><strong>Messages:</strong> content of messages sent between buyers and sellers on the platform.</li>
            <li><strong>Product images:</strong> images you upload when listing a product.</li>
        </ul>
    </div>

    <div class="pp-card">
        <h2>3. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
            <li>Create and manage your account.</li>
            <li>Facilitate buying and selling transactions between users.</li>
            <li>Enable messaging between buyers and sellers.</li>
            <li>Display your listed products to other users.</li>
            <li>Maintain platform security and prevent fraudulent activity.</li>
            <li>Improve and maintain the platform.</li>
        </ul>
    </div>

    <div class="pp-card">
        <h2>4. How We Share Your Information</h2>
        <p>We do <strong>not</strong> sell or rent your personal information to third parties. We may share information only in these circumstances:</p>
        <ul>
            <li>With other users, to the extent necessary to complete a transaction (e.g. seller details visible to buyer).</li>
            <li>With service providers who help operate the platform (e.g. hosting on Render), under strict confidentiality terms.</li>
            <li>When required by law or to protect the rights and safety of users.</li>
        </ul>
    </div>

    <div class="pp-card">
        <h2>5. Data Storage &amp; Security</h2>
        <p>Your data is stored in a secured MySQL database. Passwords are hashed and never stored in plain text. We use industry-standard measures to protect your data, though no system can guarantee absolute security.</p>
    </div>

    <div class="pp-card">
        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Withdraw consent at any time by contacting us.</li>
        </ul>
        <p style="margin-top:12px;">To exercise any of these rights, email us at <strong>info@ubuntutrade.co.za</strong>.</p>
    </div>

    <div class="pp-card">
        <h2>7. Cookies &amp; Local Storage</h2>
        <p>UbuntuTrade uses browser <strong>localStorage</strong> to keep you logged in between sessions. No third-party tracking cookies are used.</p>
    </div>

    <div class="pp-card">
        <h2>8. Children's Privacy</h2>
        <p>Our platform is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us so we can remove it.</p>
    </div>

    <div class="pp-card">
        <h2>9. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the effective date above. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
    </div>

    <div class="pp-card">
        <h2>10. Contact Us</h2>
        <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
        <ul>
            <li>Email: <strong>info@ubuntutrade.co.za</strong></li>
            <li>Platform: UbuntuTrade &mdash; Buy &amp; Sell in Your Community</li>
        </ul>
    </div>
</div>

<footer class="footer">
    <div>
        <h3>About UbuntuTrade</h3>
        <p>Connecting local buyers &amp; sellers</p>
    </div>
    <div>
        <h3>Contact</h3>
        <p>info@Ubuntutrade.co.za</p>
    </div>
    <div>
        <h3>Legal</h3>
        <a href="/privacy-policy">View Privacy Policy</a>
        <a href="/faqs">FAQs</a>
    </div>
</footer>

</body>
</html>
