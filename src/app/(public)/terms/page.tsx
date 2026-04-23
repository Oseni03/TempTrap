export default function TermsPage() {
	return (
		<div className="min-h-screen bg-background">
			<section className="max-w-4xl mx-auto px-6 py-24">
				<div className="space-y-8">
					<h1 className="text-5xl md:text-6xl font-bold tracking-tight">
						Terms of Service
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
						title: "1. Acceptance of Terms",
						content:
							"By accessing and using TempTrap ('the Service'), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
					},
					{
						title: "2. Use License",
						content:
							"Permission is granted to temporarily download one copy of the materials (information or software) on TempTrap for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to decompile or reverse engineer any software contained on the Service; remove any copyright or other proprietary notations from the materials; transferring the materials to another person or 'mirroring' the materials on any other server.",
					},
					{
						title: "3. Disclaimer",
						content:
							"The materials on TempTrap are provided on an 'as is' basis. TempTrap makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
					},
					{
						title: "4. Limitations",
						content:
							"In no event shall TempTrap or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Service, even if TempTrap or an authorized representative has been notified orally or in writing of the possibility of such damage.",
					},
					{
						title: "5. Accuracy of Materials",
						content:
							"The materials appearing on TempTrap could include technical, typographical, or photographic errors. TempTrap does not warrant that any of the materials on the Service is accurate, complete, or current. TempTrap may make changes to the materials contained on the Service at any time without notice.",
					},
					{
						title: "6. Materials and Content",
						content:
							"TempTrap has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by TempTrap of the site. Use of any such linked website is at the user's own risk.",
					},
					{
						title: "7. Modifications",
						content:
							"TempTrap may revise these terms of service for the Service at any time without notice. By using the Service, you are agreeing to be bound by the then current version of these terms of service.",
					},
					{
						title: "8. Governing Law",
						content:
							"These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which TempTrap operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.",
					},
					{
						title: "9. User Responsibilities",
						content:
							"Users are responsible for maintaining the confidentiality of their account credentials and are fully responsible for all activities that occur under their account. Users agree not to use the Service for any unlawful purpose or in violation of any applicable laws or regulations.",
					},
					{
						title: "10. Intellectual Property",
						content:
							"All content provided on the Service, including but not limited to text, graphics, logos, images, and software, is the property of TempTrap or its content suppliers and is protected by international copyright laws. Unauthorized reproduction or distribution of this content is prohibited.",
					},
					{
						title: "11. Payment Terms",
						content:
							"For paid services, you agree to pay the fees specified in your subscription plan. Payments are due as specified in your billing agreement. We reserve the right to change our fees at any time, with 30 days' notice for existing customers.",
					},
					{
						title: "12. Termination",
						content:
							"TempTrap may terminate or suspend your account and access to the Service immediately, without prior notice or liability, if you fail to comply with any provision of these Terms. Upon termination, your right to use the Service will immediately cease.",
					},
					{
						title: "13. Limitation of Liability",
						content:
							"In no event shall TempTrap, its directors, employees, or agents be liable for indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.",
					},
					{
						title: "14. Contact Information",
						content:
							"If you have any questions about these Terms of Service, please contact us at legal@temptrap.com or through our website.",
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
