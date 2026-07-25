import { LegalPageShell } from "@/modules/legal/ui/components/legal-page-shell"
import { APP_NAME } from "@workspace/shared/constants/app"

const LAST_UPDATED = "19 July 2026"

export function TermsView() {
  return (
    <LegalPageShell
      title="Terms & Conditions"
      lastUpdated={LAST_UPDATED}
      intro={`These Terms & Conditions (“Terms”) govern your use of ${APP_NAME}. By creating an account or using the service, you agree to these Terms.`}
      sections={[
        {
          title: "The service",
          paragraphs: [
            `${APP_NAME} provides a guided naming ceremony for cats, including personality summaries, name suggestions, and downloadable certificates. Features available before and after unlock may change as we improve the product.`,
          ],
        },
        {
          title: "Accounts",
          paragraphs: [
            "You must provide accurate account information and keep your login credentials secure. You are responsible for activity that occurs under your account. Contact us promptly if you believe your account has been compromised.",
          ],
        },
        {
          title: "Your content",
          paragraphs: [
            "You retain ownership of the photos, stories, and other content you submit. You grant us a limited licence to host, process, and display that content as needed to operate the ceremony — for example generating summaries, name options, and certificates.",
            "You must only upload content you have the right to use. Do not upload unlawful, infringing, or harmful material.",
          ],
        },
        {
          title: "AI-generated results",
          paragraphs: [
            "Summaries, name suggestions, and related outputs are generated with automated tools for entertainment and keepsake purposes. Results are not guaranteed to be unique outside of explicitly stated uniqueness rules (such as claimed cat-world names within our service), and they are not professional, medical, or legal advice.",
          ],
        },
        {
          title: "Payments and unlocks",
          paragraphs: [
            "Parts of the ceremony are free to explore. During our public beta, unlocking later stages is also free. When paid unlock is introduced, prices and what unlock includes will be shown before you confirm payment. Except where required by law, unlock fees will be non-refundable once the paid stages have been unlocked for that cat.",
          ],
        },
        {
          title: "Acceptable use",
          paragraphs: [
            "You agree not to misuse the service, attempt to disrupt it, reverse engineer it except as permitted by law, scrape it at scale, or use it to generate content that violates these Terms or applicable law.",
          ],
        },
        {
          title: "Intellectual property",
          paragraphs: [
            `The ${APP_NAME} name, branding, site design, and underlying software are owned by us or our licensors. You may not copy or reuse them except as allowed by these Terms or with our written permission.`,
          ],
        },
        {
          title: "Literary inspiration and non-affiliation",
          paragraphs: [
            `${APP_NAME} is an independent creative project inspired by the idea — associated with T. S. Eliot’s writing about cats — that a cat may be thought of as having more than one kind of name. Any references to Eliot, his poems, or related works are for cultural and historical context only.`,
            "We are not affiliated with, endorsed by, sponsored by, or connected to the estate or family of T. S. Eliot, their heirs, literary agents, or publishers, nor with the creators, producers, or rights holders of any stage, film, or other adaptations based on Eliot’s work (including Andrew Lloyd Webber’s Cats).",
            "We do not represent those parties, and nothing on this site or in the service should be understood as an official product, authorised adaptation, or statement on their behalf. We do not reproduce copyrighted poem text; the ceremony uses our own original wording and creative process.",
          ],
        },
        {
          title: "Disclaimer",
          paragraphs: [
            `The service is provided “as is” and “as available”. To the fullest extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the service will be uninterrupted or error-free.`,
          ],
        },
        {
          title: "Limitation of liability",
          paragraphs: [
            "To the fullest extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising from your use of the service. Our total liability for any claim relating to the service is limited to the amount you paid us for the unlock(s) giving rise to the claim in the twelve months before the claim.",
          ],
        },
        {
          title: "Termination",
          paragraphs: [
            "You may stop using the service at any time. We may suspend or end access if you breach these Terms or if we need to protect the service or other users. Provisions that by their nature should survive termination will continue to apply.",
          ],
        },
        {
          title: "Changes",
          paragraphs: [
            "We may update these Terms from time to time. When we do, we will revise the “Last updated” date above. If you continue using the service after changes take effect, you accept the updated Terms.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `Questions about these Terms can be sent using the support contact details shown in the ${APP_NAME} User Support page when you are signed in.`,
          ],
        },
      ]}
    />
  )
}
