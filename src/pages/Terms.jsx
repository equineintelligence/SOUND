import LegalShell from '@/components/LegalShell';

export default function Terms() {
  return (
    <LegalShell title="Terms of Use" updated="23 October 2026">
      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">What Sound is</h2>
        <p>
          Sound is a community platform where customers review equestrian businesses and service
          providers. Reviews are opinions about a business service, written by someone who used it.
          Sound does not review people, and it never publishes who owes money.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">For reviewers</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>You must be 18 or older and confirm your identity.</li>
          <li>You may only review a service you used yourself, in the last 24 months, with proof.</li>
          <li>You give one review per business every 12 months.</li>
          <li>You confirm the review is your honest opinion and that the facts in it are true.</li>
          <li>You have no connection to the business, and you were not paid or rewarded for it.</li>
          <li>You are responsible for what you write, including if it is false or unlawful.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">Anonymity</h2>
        <p>
          You appear under a display name and are anonymous to other users and to the business, but
          always known to Sound. We never promise absolute anonymity. We may disclose your identity
          under a court order or legal compulsion, if you knowingly posted a false review, or to
          enforce your indemnity if a claim is made against Sound.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">For businesses</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Profiles are free. Ownership is verified before a profile goes live.</li>
          <li>You are responsible for the accuracy of everything on your profile.</li>
          <li>A free listing gives no control over reviews or ratings.</li>
          <li>You may publish one reply per review. Replies are moderated.</li>
          <li>You may flag a policy breach or dispute a specific factual claim.</li>
          <li>
            Providers trading in their own name may object to being listed under the Protection of
            Personal Information Act. Companies and other juristic persons cannot.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">What we never do</h2>
        <p>
          No business can pay to remove, hide, reorder or influence a review or a rating. Rosettes
          are never sold or sponsored. There is no review gating and no incentive programme.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">Moderation and removal</h2>
        <p>
          Every review is checked against the Content Policy before it goes live. We may refuse,
          return, edit or remove any review that breaks these terms, and we may suspend accounts
          that misuse the platform. Court orders and take-down notices are acted on within 24 hours.
        </p>
      </section>
    </LegalShell>
  );
}