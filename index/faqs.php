<?php
$year = date('Y');
$updated = '2 June 2026';

$faqs = [
    [
        'question' => 'What is UbuntuTrade?',
        'answer' => 'UbuntuTrade is a local marketplace where people can browse products, list items for sale, message sellers, add products to a cart, and complete orders through the website.'
    ],
    [
        'question' => 'How do I create an account?',
        'answer' => 'Open the Register page, enter your name, email address, and password, then submit the form. After registration, sign in from the Login page to access your dashboard.'
    ],
    [
        'question' => 'How do I browse or search for products?',
        'answer' => 'Use the search bar on the home page or open Browse Products from the dashboard sidebar. You can view product details, seller information, and available items before adding anything to your cart.'
    ],
    [
        'question' => 'How do I sell an item?',
        'answer' => 'Sign in, go to your dashboard, and choose Add Product. Add a clear product name, category, price, description, and image before publishing the listing.'
    ],
    [
        'question' => 'How do I contact a seller?',
        'answer' => 'Open the product detail or seller profile page and use the message option. Messages appear in the Messages section of your dashboard.'
    ],
    [
        'question' => 'How does the cart work?',
        'answer' => 'When you find a product you want, add it to your cart. Open Your Cart to review quantities, remove items, clear the cart, or continue to checkout.'
    ],
    [
        'question' => 'Can I update my account settings?',
        'answer' => 'Yes. Sign in and open Settings from the dashboard sidebar to update account details that are available on your profile.'
    ],
    [
        'question' => 'What should I do if I have a problem?',
        'answer' => 'Check your dashboard messages first if the issue is about a seller or buyer. For platform support, email info@ubuntutrade.co.za with your account email and a short description of the problem.'
    ],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FAQs | UbuntuTrade</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        body { background: #f5f1eb; color: #333; }
        .faq-header {
            background: linear-gradient(rgba(0,0,0,0.58), rgba(0,0,0,0.58)), url('user-market.jpg');
            background-position: center;
            background-size: cover;
            color: white;
            padding: 54px 20px 44px;
            text-align: center;
        }
        .faq-header h1 { font-size: 2.2rem; margin-bottom: 10px; }
        .faq-header span { color: #e07b39; }
        .faq-header p { color: rgba(255,255,255,0.82); line-height: 1.6; margin: 0 auto; max-width: 680px; }
        .faq-container {
            margin: 36px auto 56px;
            max-width: 980px;
            padding: 0 20px;
        }
        .faq-section {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.07);
            margin-bottom: 22px;
            padding: 28px;
        }
        .faq-section h2 {
            border-bottom: 2px solid #e07b39;
            color: #1a1a2e;
            font-size: 1.15rem;
            margin-bottom: 18px;
            padding-bottom: 8px;
        }
        .faq-list {
            display: grid;
            gap: 14px;
        }
        .faq-item {
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 18px;
        }
        .faq-item h3 {
            color: #111;
            font-size: 1rem;
            margin-bottom: 8px;
        }
        .faq-item p,
        .faq-section li {
            color: #555;
            font-size: 0.95rem;
            line-height: 1.7;
        }
        .guideline-grid {
            display: grid;
            gap: 18px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .guideline-grid ul {
            margin: 0;
            padding-left: 20px;
        }
        .updated {
            color: #777;
            font-size: 0.85rem;
            margin-top: 14px;
        }
        @media (max-width: 720px) {
            .faq-header h1 { font-size: 1.75rem; }
            .faq-section { padding: 22px 18px; }
            .guideline-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

<nav class="navbar">
    <div class="logo">Ubuntu <span class="color-logo">Trade</span></div>
    <a href="/index/index.html" style="color:white;text-decoration:none;font-size:1rem;">&larr; Back to Home</a>
</nav>

<header class="faq-header">
    <h1>Ubuntu<span>Trade</span> FAQs</h1>
    <p>Find quick answers and simple guidelines for buying, selling, messaging, and using your dashboard safely.</p>
    <p class="updated">Last updated: <?php echo htmlspecialchars($updated); ?></p>
</header>

<main class="faq-container">
    <section class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
            <?php foreach ($faqs as $faq): ?>
                <article class="faq-item">
                    <h3><?php echo htmlspecialchars($faq['question']); ?></h3>
                    <p><?php echo htmlspecialchars($faq['answer']); ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </section>

    <section class="faq-section">
        <h2>Guidelines for Using the Website</h2>
        <div class="guideline-grid">
            <div>
                <h3>For Buyers</h3>
                <ul>
                    <li>Use search, categories, and product details to compare items before adding them to your cart.</li>
                    <li>Check the seller profile and ask questions through messages when something is unclear.</li>
                    <li>Review your cart carefully before checkout, especially quantity, price, and delivery fee.</li>
                    <li>Keep all buying discussions inside UbuntuTrade messages where possible.</li>
                </ul>
            </div>
            <div>
                <h3>For Sellers</h3>
                <ul>
                    <li>Use clear photos and honest descriptions so buyers know exactly what they are purchasing.</li>
                    <li>Set a fair price and keep product availability up to date from your dashboard.</li>
                    <li>Respond to buyer messages politely and as quickly as you can.</li>
                    <li>Do not list prohibited, unsafe, stolen, or misleading products.</li>
                </ul>
            </div>
        </div>
    </section>

    <section class="faq-section">
        <h2>Safety Tips</h2>
        <ul>
            <li>Use a strong password and do not share your login details with anyone.</li>
            <li>Be careful with buyers or sellers who pressure you to move conversations away from the platform.</li>
            <li>Report suspicious activity to info@ubuntutrade.co.za with screenshots or order details if available.</li>
            <li>Before buying, make sure the product, price, seller, and delivery expectations are clear.</li>
        </ul>
    </section>
</main>

<footer class="footer">
    <div>
        <h3>About UbuntuTrade</h3>
        <p>Connecting local buyers &amp; sellers</p>
    </div>
    <div>
        <h3>Contact</h3>
        <p>info@Ubuntutrade.co.za<br><a href="/contact-support">Contact Support</a></p>
    </div>
    <div>
        <h3>Legal</h3>
        <a href="/privacy-policy">View Privacy Policy</a>
        <a href="/faqs">FAQs</a>
    </div>
</footer>

</body>
</html>
