import LegalShell from '@/components/LegalShell';

export default function ContentPolicy() {
  return (
    <LegalShell title="Content Policy" updated="23 October 2026">
      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">What may be reviewed</h2>
        <p>
          Only a business or professional offering equestrian services to the public: yards and
          livery, riding schools, coaches and instructors, trainers, farriers, saddle fitters, equine
          therapists, vets, transporters, tack and feed shops. Reviews cover the service and never
          anyone private life.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">What is never published</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Anything about a private individual, including clients, riders, parents or staff by name.</li>
          <li>Anything about money someone owes, in any form.</li>
          <li>Allegations of theft, fraud, cruelty or neglect. These go to SAPS or the NSPCA instead.</li>
          <li>Allegations of professional misconduct, which go to the relevant council.</li>
          <li>Personal details: addresses, phone numbers, identity numbers, health or family information.</li>
          <li>Anything that identifies a minor.</li>
          <li>Hate speech, threats or insults, including references to race, religion, gender, nationality, sexual orientation or disability.</li>
          <li>Reviews written by someone connected to the business, or paid for, or part of a campaign.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">Writing guidance</h2>
        <p>
          Describe what happened and how it affected you. Stick to your own experience, not what
          others told you. Say what you think, but phrase it as your opinion. Avoid labels such as
          liar or thief, and leave out other people details.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">How moderation works</h2>
        <p>
          Every review is checked before it goes live, usually within 3 business days. Flags and
          disputes are handled within 5 business days, and court orders within 24 hours. Moderators
          decide whether a review follows the rules, not who is right.
        </p>
      </section>
    </LegalShell>
  );
}