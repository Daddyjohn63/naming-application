import { LegalPageShell } from "@/modules/legal/ui/components/legal-page-shell"
import { APP_NAME } from "@workspace/shared/constants/app"
import { COOKIE_THIRD_PARTIES } from "@workspace/shared/constants/cookie-third-parties"

const LAST_UPDATED = "19 July 2026"

export function PrivacyView() {
  const thirdPartyNames = COOKIE_THIRD_PARTIES.map((party) => party.name).join(
    ", "
  )

  return (
    <LegalPageShell
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro={`This Privacy Policy explains how ${APP_NAME} (“we”, “us”) collects, uses, and shares information when you use our website and naming ceremony service.`}
      sections={[
        {
          title: "Who we are",
          paragraphs: [
            `${APP_NAME} helps cat owners discover three complementary names for their cat through a guided naming ceremony. If you have privacy questions, contact us using the support details in your account’s User Support page.`,
          ],
        },
        {
          title: "Information we collect",
          paragraphs: [
            "We collect information you provide directly and information that is generated when you use the service.",
          ],
          bullets: [
            "Account details such as your name and email address when you sign up.",
            "Ceremony content you submit, including cat stories, photos, edited summaries, name shortlists, and certificate preferences.",
            "Usage and device information that helps us operate, secure, and improve the service.",
          ],
        },
        {
          title: "How we use your information",
          paragraphs: [
            "We use your information to run the naming ceremony, generate personality summaries and name suggestions, produce certificates, provide support, prevent abuse, and improve the product.",
          ],
        },
        {
          title: "Cookies and similar technologies",
          paragraphs: [
            `${APP_NAME} uses cookies and similar technologies for essential site functions (such as keeping you signed in) and, where enabled, analytics. The third-party services that may set or read cookies on our site are: ${thirdPartyNames}.`,
            "You can control cookies through your browser settings. Blocking essential cookies may prevent sign-in or other core features from working.",
          ],
          bullets: COOKIE_THIRD_PARTIES.map(
            (party) =>
              `${party.name}: ${party.purpose} Privacy details: ${party.privacyPolicyUrl}`
          ),
        },
        {
          title: "Sharing your information",
          paragraphs: [
            "We share information with service providers who help us operate the product — for example authentication, hosting, analytics, and (when you unlock a ceremony) payment processing. We do not sell your personal information.",
          ],
        },
        {
          title: "Data retention",
          paragraphs: [
            "We keep account and ceremony data for as long as your account remains active, or as needed to provide the service, resolve disputes, and meet legal obligations. You may request deletion of your account and associated ceremony data subject to any legal retention requirements.",
          ],
        },
        {
          title: "Your choices",
          paragraphs: [
            "Depending on where you live, you may have rights to access, correct, delete, or export your personal information, or to object to certain processing. Contact us if you would like to exercise those rights.",
          ],
        },
        {
          title: "Children",
          paragraphs: [
            `${APP_NAME} is not directed at children under 13 (or the equivalent minimum age in your region). We do not knowingly collect personal information from children.`,
          ],
        },
        {
          title: "Changes to this policy",
          paragraphs: [
            "We may update this Privacy Policy from time to time. When we do, we will revise the “Last updated” date above. Continued use of the service after changes means you accept the updated policy.",
          ],
        },
      ]}
    />
  )
}
