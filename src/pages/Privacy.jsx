import LegalShell from '@/components/LegalShell';

export default function Privacy() {
  return (
    <LegalShell title="Privacy Notice" updated="23 October 2026">
      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">What we collect</h2>
        <p>
          Your name, email and sign-in details; the review you wrote and the ratings you gave; proof
          that you used the service; and basic technical information needed to run the platform.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">Proof of custom stays private</h2>
        <p>
          Invoices, receipts, booking confirmations and livery agreements are stored separately from
          review content and are only ever seen by our moderators. They are never shown to a business
          or to other users. In a factual dispute, a moderator checks the proof and tells the business
          only whether the claim is supported.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">What is shown publicly</h2>
        <p>
          Your display name (first name and surname initial), your star ratings, the service you used,
          the month you used it, and your written review. Your full name, contact details and proof
          documents are never shown.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">Businesses are data subjects too</h2>
        <p>
          When a business is listed, we send it a notice explaining what is shown and how to reply,
          flag, dispute or object. Businesses are responsible for the accuracy of their own profile.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">How long we keep things</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Reviews are hidden from view 36 months after publication.</li>
          <li>Proof documents are deleted 12 months after publication, or once a dispute closes.</li>
          <li>Rejected submissions are deleted after 12 months.</li>
          <li>Access and audit logs are kept for 5 years.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">Your rights</h2>
        <p>
          You may ask to see, correct or delete your personal information, and you may object to how
          it is used. Contact the Sound information officer through the app.
        </p>
      </section>
    </LegalShell>
  );
}