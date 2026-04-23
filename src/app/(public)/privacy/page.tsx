export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-background">
			<section className="max-w-4xl mx-auto px-6 py-24">
				<div className="space-y-8">
					<h1 className="text-5xl md:text-6xl font-bold tracking-tight">
						Privacy Policy
					</h1>
					<p className="text-muted-foreground font-light">
						Last updated:{" "}
						{new Date().toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
				</div>
			</section>

			<section className="max-w-4xl mx-auto px-6 pb-24 space-y-12 border-t border-border/30 pt-12">
				{[
					{
						title: "1. Introduction",
						content:
							"TempTrap ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.",
					},
					{
						title: "2. Information We Collect",
						content:
							"We collect information you provide directly to us, such as when you create an account, subscribe to our services, or contact us for support. This includes your name, email address, company information, phone number, and payment information. We also automatically collect certain information when you visit our website, including your IP address, browser type, operating system, and pages visited.",
					},
					{
						title: "3. How We Use Your Information",
						content:
							"We use the information we collect to provide, improve, and personalize our services; process transactions and send related information; send administrative information and updates; respond to your inquiries; and comply with legal obligations. We also use this information to monitor and analyze trends and usage.",
					},
					{
						title: "4. Data Sharing",
						content:
							"We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our website and conducting our business, subject to confidentiality agreements. We may also disclose information when required by law or to protect our rights and safety.",
					},
					{
						title: "5. Data Security",
						content:
							"We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.",
					},
					{
						title: "6. Data Retention",
						content:
							"We retain your personal information for as long as your account is active or as necessary to provide you with our services. You may request deletion of your data at any time, subject to certain legal or contractual obligations.",
					},
					{
						title: "7. Cookies and Tracking",
						content:
							"We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookie settings through your browser preferences. We do not track you across third-party websites.",
					},
					{
						title: "8. Your Rights",
						content:
							"Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data. To exercise these rights, please contact us at privacy@temptrap.com.",
					},
					{
						title: "9. International Data Transfers",
						content:
							"Your information may be transferred to, stored in, and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for international data transfers.",
					},
					{
						title: "10. Children's Privacy",
						content:
							"Our services are not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn we have collected such information, we will promptly delete it.",
					},
					{
						title: "11. Changes to This Policy",
						content:
							"We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the 'Last updated' date on this page. Your continued use of our services constitutes your acceptance of the updated policy.",
					},
					{
						title: "12. Contact Us",
						content:
							"If you have questions about this Privacy Policy or our privacy practices, please contact us at privacy@temptrap.com or write to us at our registered address.",
					},
				].map((section) => (
					<div key={section.title} className="space-y-4">
						<h2 className="text-2xl font-semibold">
							{section.title}
						</h2>
						<p className="text-muted-foreground font-light leading-relaxed">
							{section.content}
						</p>
					</div>
				))}
			</section>
		</div>
	);
}
